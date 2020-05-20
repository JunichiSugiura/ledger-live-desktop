// @flow
import React from "react";
import { useTranslation } from "react-i18next";
import { useCosmosDelegationsQuerySelector } from "@ledgerhq/live-common/lib/families/cosmos/react";
import type { CosmosFormattedDelegation } from "@ledgerhq/live-common/lib/families/cosmos/react";
import type { Transaction } from "@ledgerhq/live-common/lib/families/cosmos/types";
import type { Account } from "@ledgerhq/live-common/lib/types";
import FirstLetterIcon from "~/renderer/components/FirstLetterIcon";
import Box from "~/renderer/components/Box";
import Label from "~/renderer/components/Label";
import Select from "~/renderer/components/Select";
import Text from "~/renderer/components/Text";

type Props = {
  account: Account,
  transaction: Transaction,
  onChange: (delegaiton: CosmosFormattedDelegation) => void,
};

export default function ValidatorField({ account, transaction, onChange }: Props) {
  const { t } = useTranslation();
  const { query, setQuery, options, value } = useCosmosDelegationsQuerySelector(
    account,
    transaction,
  );

  return (
    <Box>
      <Label>{t("cosmos.undelegation.flow.steps.amount.fields.validator")}</Label>
      <Select
        value={value}
        options={options}
        inputValue={query}
        onInputChange={setQuery}
        renderOption={OptionRow}
        renderValue={OptionRow}
        onChange={onChange}
      />
    </Box>
  );
}

type OptionRowProps = {
  data: CosmosFormattedDelegation,
};

function OptionRow({ data: { address, validator, formattedAmount } }: OptionRowProps) {
  return (
    <Box key={address} horizontal alignItems="center" justifyContent="space-between">
      <Box horizontal alignItems="center">
        <FirstLetterIcon label={validator?.name ?? address} mr={2} />
        <Text ff="Inter|Medium">{validator?.name ?? address}</Text>
      </Box>
      <Text ff="Inter|Regular">{formattedAmount}</Text>
    </Box>
  );
}