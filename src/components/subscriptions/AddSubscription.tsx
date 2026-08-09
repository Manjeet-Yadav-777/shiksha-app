import { Alert, Button, Checkbox, Stack } from '@mantine/core';
import { Form } from 'react-final-form';
import { Dialog } from '../../libs/basic/Dialog';
import { BillingCycle, SubscriptionStatus, type ISubscription } from './store';
import { Inline } from '../../libs/basic/Layout';
import { SelectInputField } from '../../libs/form/SelectInputField';
import { TextInputField } from '../../libs/form/Input';
import { DatenputField } from '../../libs/form/DateInputField';
import dayjs from 'dayjs';

interface IAddSubscriptionFormValues {
  amount?: number;
  currency: string;
  billing_cycle: BillingCycle;
  start_date: string | Date;
  auto_renew: boolean;
  status: SubscriptionStatus;
  notes?: string;
}

export function AddSubscription({
  isOpened,
  close,
  title,
  propInitialValues,
  onSubmit,
}: {
  isOpened: boolean;
  close: () => void;
  title: string;
  propInitialValues?: ISubscription;
  onSubmit: (values: IAddSubscriptionFormValues) => void;
}) {
  const initialValues: IAddSubscriptionFormValues = propInitialValues
    ? {
        amount: propInitialValues.amount,
        currency: propInitialValues.currency,
        notes: propInitialValues.notes,
        billing_cycle: propInitialValues.billingCycle,
        auto_renew: propInitialValues.autoRenew,
        start_date: propInitialValues.startDate,
        status: propInitialValues.status,
      }
    : {
        currency: 'INR',
        billing_cycle: BillingCycle.MONTHLY,
        auto_renew: false,
        status: SubscriptionStatus.ACTIVE,
        start_date: new Date(),
      };
  return (
    <Dialog sizes="55rem" isOpened={isOpened} close={close} title={title}>
      <Form<IAddSubscriptionFormValues>
        initialValues={initialValues}
        onSubmit={async (values) => {
          onSubmit(values);
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInputField
                type="number"
                name="amount"
                label="Amount"
                placeholder="999"
                min={0}
              />

              <TextInputField
                name="currency"
                label="Currency"
                placeholder="INR"
                disabled
              />

              <SelectInputField
                name="billing_cycle"
                label="Billing Cycle"
                data={[
                  {
                    value: BillingCycle.MONTHLY,
                    label: 'Monthly',
                  },
                  {
                    value: BillingCycle.YEARLY,
                    label: 'Yearly',
                  },
                  {
                    value: BillingCycle.LIFETIME,
                    label: 'Lifetime',
                  },
                ]}
              />

              <DatenputField
                minDate={dayjs().format('YYYY-MM-DD')}
                maxDate={dayjs().add(1, 'month').format('YYYY-MM-DD')}
                name="start_date"
                label="Start Date"
              />

              <SelectInputField
                name="status"
                label="Status"
                data={[
                  {
                    value: SubscriptionStatus.ACTIVE,
                    label: 'Active',
                  },
                  {
                    value: SubscriptionStatus.TRIAL,
                    label: 'Trial',
                  },
                  {
                    value: SubscriptionStatus.EXPIRED,
                    label: 'Expired',
                  },
                  {
                    value: SubscriptionStatus.CANCELLED,
                    label: 'Cancelled',
                  },
                ]}
              />

              <Checkbox label="Auto Renew" defaultChecked />

              <TextInputField
                type="textarea"
                name="notes"
                label="Notes"
                placeholder="Write additional notes..."
              />

              <Alert color="blue" fw="bold">
                Subscription end date and next billing date will be calculated
                automatically based on the selected billing cycle.
              </Alert>

              <Inline justify="end" gap="md">
                <Button type="submit">Save Subscription</Button>

                <Button variant="default" onClick={close}>
                  Cancel
                </Button>
              </Inline>
            </Stack>
          </form>
        )}
      </Form>
    </Dialog>
  );
}
