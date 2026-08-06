import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Button, Stack, Text, Badge, Group, Divider } from '@mantine/core';
import { Form } from 'react-final-form';
import { IconBrandWhatsapp, IconCash, IconHistory } from '@tabler/icons-react';
import { Search } from '../../libs/search/Search';
import { useLocationQuery, useSearch } from '../../utils/filterQuery';
import { ListView } from '../../libs/List/List';
import { Table } from '../../libs/basic/Table';
import { Dialog, useDialog } from '../../libs/basic/Dialog';
import { Inline } from '../../libs/basic/Layout';
import { TextInputField } from '../../libs/form/Input';
import { SelectInputField } from '../../libs/form/SelectInputField';
import { api } from '../../libs/XHR/xhr';
import { formatDate } from '../../helpers/Date';
import {
  PAYMENT_METHOD_OPTIONS,
  statusColor,
  type IStudentFee,
  type IFeePayment,
} from './store';
import { ShareViaWhatsApp } from '../../libs/sharing/whatsapp/Whatsapp';
import { OptionHeader } from '../../libs/sharing/OptionHeader';

interface IPaymentFormValues {
  amount?: number;
  paymentMethod?: string;
  remarks?: string;
}

const SWR_KEY = '/fees/student-fees';

export function StudentFeeList() {
  const [query, setQuery] = useLocationQuery();
  const [params, setParams] = useSearch(query);
  const collectDialog = useDialog();
  const historyDialog = useDialog();
  const whatsappDialog = useDialog();
  const [selected, setSelected] = useState<IStudentFee>();

  useEffect(() => {
    setQuery(params);
  }, [params, setQuery]);

  return (
    <Search
      title="Student Fees"
      placeHolder="Search student fees..."
      onSearch={(p) => setParams(p)}
    >
      {({ setSearchParams }) => (
        <ListView<IStudentFee>
          params={params}
          onParamsChange={(newParams) => setSearchParams(newParams)}
          swrKey={SWR_KEY}
          fetchFn={async () => await api.get(SWR_KEY, { params })}
        >
          {(items) => (
            <>
              <Table
                headers={[
                  'Student',
                  'Fee',
                  'Net Amount',
                  'Paid',
                  'Balance',
                  'Status',
                  'Due Date',
                  'Fee Reminder',
                  'Actions',
                ]}
                rows={items.map((sf) => {
                  const balance = sf.netAmount - sf.amountPaid;
                  return [
                    <Text fw="bold">{sf.student?.user?.name ?? '-'}</Text>,
                    <Text>{sf.feeStructure?.name ?? '-'}</Text>,
                    <Text>₹{sf.netAmount.toLocaleString('en-IN')}</Text>,
                    <Text>₹{sf.amountPaid.toLocaleString('en-IN')}</Text>,
                    <Text>₹{balance.toLocaleString('en-IN')}</Text>,
                    <Badge variant="light" color={statusColor(sf.status)}>
                      {sf.status}
                    </Badge>,
                    <Text>{sf.dueDate ? formatDate(sf.dueDate) : '-'}</Text>,
                    <>
                      <Button
                        variant="filled"
                        c={'white'}
                        bg={'green'}
                        size="compact-sm"
                        leftSection={<IconBrandWhatsapp size={14} />}
                        onClick={() => {
                          setSelected(sf);
                          whatsappDialog.open();
                        }}
                      >
                        WA Reminder
                      </Button>
                    </>,
                    <Inline gap="xs">
                      <Button
                        variant="light"
                        size="compact-sm"
                        leftSection={<IconCash size={14} />}
                        disabled={sf.status === 'paid'}
                        onClick={() => {
                          setSelected(sf);
                          collectDialog.open();
                        }}
                      >
                        Collect
                      </Button>
                      <Button
                        variant="subtle"
                        size="compact-sm"
                        leftSection={<IconHistory size={14} />}
                        onClick={() => {
                          setSelected(sf);
                          historyDialog.open();
                        }}
                      >
                        History
                      </Button>
                    </Inline>,
                  ];
                })}
              />

              <Dialog
                sizes="45rem"
                isOpened={collectDialog.isOpened}
                close={collectDialog.close}
                title={`Collect Payment - ${selected?.student?.user?.name ?? ''}`}
              >
                {selected && (
                  <CollectPaymentForm
                    studentFee={selected}
                    close={collectDialog.close}
                    onDone={() => {
                      mutate([SWR_KEY, params]);
                      collectDialog.close();
                    }}
                  />
                )}
              </Dialog>

              <Dialog
                sizes="55rem"
                isOpened={historyDialog.isOpened}
                close={historyDialog.close}
                title={`Payment History - ${selected?.student?.user?.name ?? ''}`}
              >
                {selected && <PaymentHistory studentFeeId={selected._id} />}
              </Dialog>
              <Dialog
                sizes="55rem"
                isOpened={whatsappDialog.isOpened}
                close={whatsappDialog.close}
                title={`Whatsapp Reminder`}
              >
                {selected && <WhastappContent studentFee={selected} />}
              </Dialog>
            </>
          )}
        </ListView>
      )}
    </Search>
  );
}

function CollectPaymentForm({
  studentFee,
  close,
  onDone,
}: {
  studentFee: IStudentFee;
  close: () => void;
  onDone: () => void;
}) {
  const balance = studentFee.netAmount - studentFee.amountPaid;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text c="gray">Fee: {studentFee.feeStructure?.name}</Text>
        <Text fw="bold">Outstanding: ₹{balance.toLocaleString('en-IN')}</Text>
      </Group>
      <Divider />
      <Form<IPaymentFormValues>
        initialValues={{ amount: balance, paymentMethod: 'cash' }}
        onSubmit={async (values) => {
          await api.post('/fees/payments', {
            studentFeeId: studentFee._id,
            amount: Number(values.amount),
            paymentMethod: values.paymentMethod,
            remarks: values.remarks,
          });
          onDone();
        }}
      >
        {({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Inline gap="lg">
                <TextInputField
                  w="50%"
                  type="number"
                  name="amount"
                  label="Amount (₹)"
                  placeholder="0"
                />
                <SelectInputField
                  w="50%"
                  name="paymentMethod"
                  label="Payment Method"
                  placeholder="Select method"
                  data={PAYMENT_METHOD_OPTIONS}
                />
              </Inline>
              <TextInputField
                type="textarea"
                name="remarks"
                label="Remarks (optional)"
                placeholder="Any note about this payment"
              />
              <Inline justify="end" gap="md">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Payment'}
                </Button>
                <Button variant="default" onClick={close}>
                  Cancel
                </Button>
              </Inline>
            </Stack>
          </form>
        )}
      </Form>
    </Stack>
  );
}

function PaymentHistory({ studentFeeId }: { studentFeeId: number }) {
  const { data, isLoading } = useSWR(
    ['/fees/student-fees/payments', studentFeeId],
    async () =>
      api.get<{ studentFee: IStudentFee; payments: IFeePayment[] }>(
        `/fees/student-fees/${studentFeeId}/payments`,
      ),
  );

  if (isLoading) {
    return (
      <Text c="gray" ta="center" py="lg">
        Loading...
      </Text>
    );
  }

  const payments = data?.payments ?? [];

  return (
    <Stack gap="md">
      {data?.studentFee && (
        <Group justify="space-between">
          <Text c="gray">
            Net: ₹{data.studentFee.netAmount.toLocaleString('en-IN')} · Paid: ₹
            {data.studentFee.amountPaid.toLocaleString('en-IN')}
          </Text>
          <Badge variant="light" color={statusColor(data.studentFee.status)}>
            {data.studentFee.status}
          </Badge>
        </Group>
      )}
      <Divider />
      {!payments.length ? (
        <Text c="gray" ta="center" py="lg">
          No payments recorded yet.
        </Text>
      ) : (
        <Table
          headers={['Receipt', 'Amount', 'Method', 'Date', 'Remarks']}
          rows={payments.map((p) => [
            <Text ff="monospace">{p.receiptNumber}</Text>,
            <Text fw="bold">₹{p.amount.toLocaleString('en-IN')}</Text>,
            <Badge variant="light">{p.paymentMethod.replace('_', ' ')}</Badge>,
            <Text>{formatDate(p.paymentDate)}</Text>,
            <Text>{p.remarks || '-'}</Text>,
          ])}
        />
      )}
    </Stack>
  );
}

type TWhatsappContentState = {
  switchHindi: boolean;
};
export function WhastappContent({ studentFee }: { studentFee: IStudentFee }) {
  const [states, setStates] = useState<TWhatsappContentState>({
    switchHindi: false,
  });

  const options = [
    {
      name: 'switchHindi',
      label: 'Hindi Template',
    },
  ];

  const { engContent, hindiContent } = getWAContentForFeeRemider(studentFee);

  const content = states.switchHindi ? hindiContent : engContent;

  return (
    <Stack>
      <OptionHeader options={options} states={states} setStates={setStates} />
      <ShareViaWhatsApp phoneNumber="919166024500" contentToShare={content} />
    </Stack>
  );
}

function getWAContentForFeeRemider(sf: IStudentFee) {
  const engContent = `### 🔔 Fee Payment Reminder

&nbsp;

Dear **Parent/Guardian**,  

This is a friendly reminder that your child's school fee is pending.

---

**👨‍🎓 Student Details**

**Student Name:** ${sf.student.user.name}  
**Class:** ${sf.student.class?.name}-${sf.student.section?.name}  
**Admission No.:** ${sf.student.admissionNumber}  

---

### 💰 Fee Details


**Total Fee:** ₹${sf.netAmount.toLocaleString('en-In')}  
**Amount Paid:** ₹${sf.amountPaid.toLocaleString('en-IN')}  
**Pending Amount:** **₹${(sf.netAmount - sf.amountPaid).toLocaleString('en-IN')}**  
**Due Date:** ${sf.dueDate ? formatDate(sf.dueDate) : '-'}  

---

**📢 Important Notice**

Kindly pay the pending fee on or before the due date to avoid late payment charges.

If you have already made the payment, please ignore this message or share the payment receipt with the school office.

&nbsp;

**📞 Contact**

School Office`;

  const hindiContent = `### 🔔 फीस जमा करने का रिमाइंडर

&nbsp;

नमस्ते **अभिभावक जी,**

आपको याद दिलाना है कि आपके बच्चे की स्कूल फीस अभी जमा नहीं हुई है।

---

**👨‍🎓 बच्चे की जानकारी**

**बच्चे का नाम:** ${sf.student.user.name}  
**कक्षा:** ${sf.student.class?.name}-${sf.student.section?.name}  
**एडमिशन नंबर:** ${sf.student.admissionNumber}  

---

### 💰 फीस की जानकारी

&nbsp;

**कुल फीस:** ₹${sf.netAmount.toLocaleString('en-In')}  
**जमा की गई फीस:** ₹${sf.amountPaid.toLocaleString('en-In')}  
**बाकी फीस:** **₹${(sf.netAmount - sf.amountPaid).toLocaleString('en-IN')}**  
**फीस जमा करने की आखिरी तारीख:** ${sf.dueDate ? formatDate(sf.dueDate) : '-'}  

---

**📢 जरूरी सूचना**

कृपया आखिरी तारीख से पहले बच्चे की बाकी फीस जमा कर दें, ताकि किसी भी तरह का लेट फीस चार्ज न लगे।

अगर आपने फीस पहले ही जमा कर दी है, तो इस मैसेज को नजरअंदाज करें या फीस जमा करने की रसीद स्कूल में जमा कर दें।

&nbsp;

**📞 संपर्क करें**

स्कूल कार्यालय`;

  return {
    engContent,
    hindiContent,
  };
}
