import useSWR, { mutate } from "swr";
import {
  Avatar,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  Badge,
  Alert,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { api, xhr } from "../../libs/XHR/xhr";
import type { ITenant } from "./store";
import { formatDate } from "../../helpers/Date";
import { Inline } from "../../libs/basic/Layout";
import { EditTenant } from "./List";
import { Dialog, useDialog } from "../../libs/basic/Dialog";
import { Form } from "react-final-form";
import { TextInputField } from "../../libs/form/Input";
import { capitalize, getRole } from "../../helpers/Wording";
import { AddSubscription } from "../subscriptions/AddSubscription";

export function SingleTenant({ id }: { id?: string }) {
  const { data: tenant } = useSWR(`/tenant/${id}`, () =>
    api.get<ITenant>(`/tenant/${id}`),
  );
  const editDialog = useDialog();
  const editAdmin = useDialog();
  const editSub = useDialog();
  const addSub = useDialog();

  if (!tenant) return null;

  return (
    <Container fluid p="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Avatar color="dark" radius="100%" size={100}>
            {tenant.name[0]}
          </Avatar>

          <Stack gap={0}>
            <Text fw={700} fz={30}>
              {tenant.name}
            </Text>

            <Text c="dimmed">{tenant.slug.toUpperCase()}</Text>

            <Badge
              mt={6}
              color={tenant.status === "active" ? "green" : "red"}
              variant="light"
              w="fit-content"
            >
              {tenant.status}
            </Badge>
          </Stack>
        </Group>

        <Button
          onClick={() => editDialog.open()}
          leftSection={<IconPencil size={16} />}
        >
          Edit School
        </Button>
        <EditTenant
          isOpen={editDialog.isOpened}
          close={editDialog.close}
          initialValues={tenant}
          title="Edit Tenant"
          onSubmit={async (values) => {
            await api.put(`/tenant/${id}`, values);
            mutate(`/tenant/${id}`);
            editDialog.close();
          }}
        />
      </Group>

      <Divider mb="xl" />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <InfoCard title="School Information">
            <InfoRow label="School Name" value={tenant.name} />
            <InfoRow label="Email" value={tenant.contactEmail} />
            <InfoRow label="Phone" value={tenant.contactPhone} />
            <InfoRow label="Address" value={tenant.address} />
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <InfoCard
            title="Administrator"
            actions={
              <>
                {tenant.admin ? null : (
                  <Button size="xs" onClick={() => editAdmin.open()}>
                    <Inline align={"center"} gap={"sm"}>
                      <IconPencil size={16} />
                      Add Admin
                    </Inline>
                  </Button>
                )}
                <AddAdmin
                  isOpened={editAdmin.isOpened}
                  close={editAdmin.close}
                  title="Edit Admin"
                  tenantId={id}
                />
              </>
            }
          >
            {tenant.admin ? (
              <>
                <InfoRow label="Name" value={tenant.admin?.name} />
                <InfoRow label="Email" value={tenant.admin?.email} />
                <InfoRow
                  label="Role"
                  value={getRole(tenant.admin?.role).toUpperCase()}
                />
                <InfoRow
                  label="Status"
                  value={capitalize(tenant.admin?.status)}
                />
              </>
            ) : (
              <Inline
                align={"center"}
                justify={"center"}
                c={"gray"}
                fw={"bold"}
                h={"18vh"}
              >
                No Details Provided
              </Inline>
            )}
          </InfoCard>
        </Grid.Col>
        <Grid.Col span={12}>
          <InfoCard
            title="Subscription Information"
            actions={
              tenant.subscription ? (
                <>
                  <Button size="xs" onClick={() => editSub.open()}>
                    <Inline align={"center"} gap={"sm"}>
                      <IconPencil size={16} />
                      Edit Subcription
                    </Inline>
                  </Button>
                  <AddSubscription
                    isOpened={editSub.isOpened}
                    close={editSub.close}
                    title="Edit Subscription"
                    propInitialValues={tenant.subscription}
                    onSubmit={async (values) => {
                      await xhr.put(`/subs/${tenant._id}/update`, values);
                      mutate(`/tenant/${tenant._id}`);
                      editSub.close();
                    }}
                  />
                </>
              ) : (
                <>
                  <Button size="xs" onClick={() => addSub.open()}>
                    <Inline align={"center"} gap={"sm"}>
                      <IconPencil size={16} />
                      Add Subcription
                    </Inline>
                  </Button>
                  <AddSubscription
                    isOpened={addSub.isOpened}
                    close={addSub.close}
                    title="Add Subscription"
                    onSubmit={async (values) => {
                      await api.post(`/subs/${tenant._id}/add`, {
                        ...values,
                      });

                      mutate(`/tenant/${tenant._id}`);
                      addSub.close();
                    }}
                  />
                </>
              )
            }
          >
            {tenant.subscription ? (
              <>
                <InfoRow
                  label="Amount"
                  value={`${tenant.subscription.currency} ${tenant.subscription.amount.toLocaleString()}`}
                />

                <InfoRow
                  label="Billing Cycle"
                  value={tenant.subscription.billing_cycle.toUpperCase()}
                />

                <InfoRow
                  label="Status"
                  value={
                    <Badge
                      color={
                        tenant.subscription.status === "active"
                          ? "green"
                          : tenant.subscription.status === "expired"
                            ? "red"
                            : tenant.subscription.status === "trial"
                              ? "blue"
                              : "gray"
                      }
                      variant="light"
                    >
                      {tenant.subscription.status.toUpperCase()}
                    </Badge>
                  }
                />

                <InfoRow
                  label="Start Date"
                  value={formatDate(tenant.subscription.start_date)}
                />

                <InfoRow
                  label="End Date"
                  value={
                    tenant.subscription.end_date
                      ? formatDate(tenant.subscription.end_date)
                      : "-"
                  }
                />

                <InfoRow
                  label="Next Billing"
                  value={
                    tenant.subscription.next_billing_date
                      ? formatDate(tenant.subscription.next_billing_date)
                      : "-"
                  }
                />

                <InfoRow
                  label="Auto Renew"
                  value={tenant.subscription.auto_renew ? "Yes" : "No"}
                />

                <InfoRow
                  label="Currency"
                  value={tenant.subscription.currency}
                />

                <InfoRow
                  label="Notes"
                  value={tenant.subscription.notes || "-"}
                />
              </>
            ) : (
              <Inline
                align="center"
                justify="center"
                c="gray"
                fw="bold"
                h="17vh"
              >
                No Details Provided
              </Inline>
            )}
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={12}>
          <InfoCard title="System Information">
            <InfoRow label="Tenant ID" value={tenant._id} />
            <InfoRow label="Created At" value={formatDate(tenant.createdAt)} />
            <InfoRow label="Updated At" value={formatDate(tenant.updatedAt)} />
          </InfoCard>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

function InfoCard({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card shadow="xs" withBorder radius="md" p="lg">
      <Stack gap="md">
        <Inline align={"center"} justify={"space-between"}>
          <Text fw={600} fz="lg">
            {title}
          </Text>
          {actions}
        </Inline>
        <Divider />

        {children}
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Group justify="space-between" align="flex-start">
      <Text c="dimmed">{label}</Text>

      <Text fw={500} ta="right">
        {value || "-"}
      </Text>
    </Group>
  );
}

interface IAddAdminFormValues {
  name: string;
  email: string;
  password?: string;
}

export function AddAdmin({
  isOpened,
  close,
  title,
  tenantId,
}: {
  isOpened: boolean;
  close: () => void;
  title: string;
  tenantId?: string;
}) {
  return (
    <Dialog isOpened={isOpened} close={close} title={title}>
      <Form<IAddAdminFormValues>
        onSubmit={async (values) => {
          console.log(values);
          await api.post(`/tenant/${tenantId}/admin`, values);
          mutate(`/tenant/${tenantId}`);
          close();
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Stack gap={"md"}>
              <TextInputField
                name="name"
                label="Admin Name"
                placeholder="Jhon Doe"
              />
              <TextInputField
                name="email"
                label="Admin Email"
                placeholder="jhon@gmail.com"
              />
              <TextInputField
                type="password"
                name="password"
                label="Admin Password"
                placeholder="*******"
              />
              <Alert color="orange" fw={"bold"}>
                Review details carefully this is one time process
              </Alert>
              <Inline gap={"md"} justify={"end"}>
                <Button type="submit">Add Admin</Button>
                <Button variant="default" onClick={() => close()}>
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
