// @flow
import React, { useCallback, useState, useEffect } from "react";
import querystring from "querystring";
import { useDispatch, useSelector } from "react-redux";
import type { Account } from "@ledgerhq/live-common/lib/types";
import useTheme from "~/renderer/hooks/useTheme";
import { activeAccountsSelector } from "~/renderer/reducers/accounts";
import Modal from "~/renderer/components/Modal";
import ModalBody from "~/renderer/components/Modal/ModalBody";
import { closeModal } from "~/renderer/actions/modals";
import SelectAccount from "~/renderer/components/SelectAccount";
import Switch from "~/renderer/components/Switch";
import Button from "~/renderer/components/Button";
import Box from "~/renderer/components/Box";

/**
 * PROBLEMS
 * - no dark mode support?
 * - the links open in a popup that instant-lose focus, not sure why...(probably on our side)
 * - no events are emitted from the steps asking to validate address: we need step events to be able to implement our UI to "validate on device" (at least to trigger the device logic on the step "Coinify will deliver BTC for this order to the BTC wallet address")
 * - on sandbox, I was not able to finish the process, i always get ETH address provided is invalid. ( 0x6AcE540252e8e472EF541499197F59CF6371dC9D )
 */

const Main = ({ account, sandbox }: { account: Account, sandbox: boolean }) => {
  const primaryColor = useTheme("colors.wallet");
  const fontColor = useTheme("colors.black");
  const url = sandbox
    ? "https://trade-ui.sandbox.coinify.com/widget"
    : "https://trade-ui.coinify.com/widget";
  const partnerId = sandbox ? 104 : 119;

  useEffect(() => {
    function onMessage(e) {
      console.log("event", e);
      if (e.origin !== url) return;
      console.log("from " + url, e);
      // TODO no events at the moment, we need it to trigger on device...
      // ? maybe a device step need to happen before that Main too
    }

    window.addEventListener("message", onMessage, false);
    return () => window.removeEventListener("message", onMessage, false);
  }, [url]);

  return (
    <>
      <iframe
        style={{
          border: "none",
          width: "100%",
          height: 400,
        }}
        src={
          url +
          "?" +
          querystring.stringify({
            fontColor,
            primaryColor,
            partnerId,
            cryptoCurrencies: account.currency.ticker,
            address: account.freshAddress,
          })
        }
        targetPage="buy"
        sandbox
        allow="camera"
      ></iframe>
    </>
  );
};

const Root = () => {
  const accounts = useSelector(activeAccountsSelector);
  // ^FIXME in reality we would have to filter only supported accounts
  const [account, setAccount] = useState(accounts[0]);
  const [sandbox, setSandbox] = useState(true);
  // ^FIXME in reality we would have no sandbox mode here (but maybe a env var)
  const [main, setMain] = useState(false);

  if (main && account) {
    return <Main account={account} sandbox={sandbox} />;
  }

  return (
    <Box flow={2}>
      {/* $FlowFixMe */}
      <SelectAccount accounts={accounts} value={account} onChange={setAccount} />
      <Box horizontal flow={2}>
        <Switch isChecked={sandbox} onChange={setSandbox} />
        <span>sandbox mode</span>
      </Box>
      <Box alignItems="flex-end">
        <Button primary onClick={() => setMain(true)}>
          Continue
        </Button>
      </Box>
    </Box>
  );
};

const BuyCrypto = () => {
  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    dispatch(closeModal("MODAL_BUY_CRYPTO"));
  }, [dispatch]);

  return (
    <Modal name="MODAL_BUY_CRYPTO" preventBackdropClick centered>
      <ModalBody onClose={onClose} title="Buy crypto" render={() => <Root />} />
    </Modal>
  );
};

export default BuyCrypto;
