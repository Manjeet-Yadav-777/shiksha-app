import { Alert, Button, Stack } from "@mantine/core";
import { Dialog } from "../../libs/basic/Dialog";
import type { IInstallment } from "./store";
import { Inline } from "../../libs/basic/Layout";
import { TextInputField } from "../../libs/form/Input";
import { Form } from "react-final-form";
import { mutate } from "swr";
import { api } from "../../libs/XHR/xhr";
import { DatenputField } from "../../libs/form/DateInputField";

export function LogPayment({
  isOpen,
  close,
  title,
  installment,
  params
}: {
  isOpen: boolean;
  close: () => void;
  title: string;
  installment?: IInstallment;
  params : any
}) {
  console.log(installment);
  return (
    <Dialog isOpened={isOpen} close={close} title={title}>
      <Form
        initialValues={{
          amount: installment?.amount,
          notes: installment?.notes,
        }}
        onSubmit={async (values) => {
          await api.post(`/installment/${installment?._id}/payments`, values);

          mutate(["/installment/getall", params]);
          close();
        }}
      >
        {({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInputField
                type="number"
                name="amount"
                label={`Payment Amount (${installment?.subscription.currency})`}
                placeholder="Enter amount"
                min={1}
                max={installment?.amount}
              />

              {values.amount &&
                installment &&
                values.amount < installment.amount && (
                  <DatenputField
                    name="due_date"
                    label="Next Due Date"
                    placeholder="Select due date for remaining payment"
                    minDate={new Date()}
                  />
                )}

              <TextInputField
                name="notes"
                label="Notes"
                placeholder="Optional notes"
              />

              <Alert color="orange" fw={"bold"}>
                Remaining amount will automatically create a new installment.
              </Alert>

              <Inline justify="end" gap="md">
                <Button variant="default" onClick={close}>
                  Cancel
                </Button>

                <Button type="submit">Log Payment</Button>
              </Inline>
            </Stack>
          </form>
        )}
      </Form>
    </Dialog>
  );
}
