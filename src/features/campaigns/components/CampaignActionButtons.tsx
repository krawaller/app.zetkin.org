import { Box } from '@mui/material';
import { Link } from '@mui/material';
import {
  AssignmentOutlined,
  CheckBoxOutlined,
  Delete,
  Event,
  HeadsetMic,
  OpenInNew,
  Settings,
} from '@mui/icons-material';
import React, { useContext, useState } from 'react';

import CampaignDetailsForm from 'features/campaigns/components/CampaignDetailsForm';
import { DialogContent as CreateTaskDialogContent } from 'zui/ZUISpeedDial/actions/createTask';
import messageIds from '../l10n/messageIds';
import useCampaign from '../hooks/useCampaign';
import useCreateCampaignActivity from '../hooks/useCreateCampaignActivity';
import useCreateEvent from 'features/events/hooks/useCreateEvent';
import { useNumericRouteParams } from 'core/hooks';
import { ZetkinCampaign } from 'utils/types/zetkin';
import ZUIButtonMenu from 'zui/ZUIButtonMenu';
import { ZUIConfirmDialogContext } from 'zui/ZUIConfirmDialogProvider';
import ZUIDialog from 'zui/ZUIDialog';
import ZUIEllipsisMenu from 'zui/ZUIEllipsisMenu';
import { Msg, useMessages } from 'core/i18n';

enum CAMPAIGN_MENU_ITEMS {
  EDIT_CAMPAIGN = 'editCampaign',
  DELETE_CAMPAIGN = 'deleteCampaign',
  SHOW_PUBLIC_PAGE = 'showPublicPage',
}

interface CampaignActionButtonsProps {
  campaign: ZetkinCampaign;
}

const CampaignActionButtons: React.FunctionComponent<
  CampaignActionButtonsProps
> = ({ campaign }) => {
  const messages = useMessages(messageIds);
  const { orgId, campId } = useNumericRouteParams();

  // Dialogs
  const { showConfirmDialog } = useContext(ZUIConfirmDialogContext);
  const [editCampaignDialogOpen, setEditCampaignDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);

  const { createEvent } = useCreateEvent(orgId);
  const { createCallAssignment, createSurvey } = useCreateCampaignActivity(
    orgId,
    campId
  );
  const { deleteCampaign, updateCampaign } = useCampaign(orgId, campaign.id);

  const handleCreateEvent = () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() + 1);
    defaultStart.setMinutes(0);
    defaultStart.setSeconds(0);
    defaultStart.setMilliseconds(0);

    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    createEvent({
      activity_id: null,
      campaign_id: campaign.id,
      end_time: defaultEnd.toISOString(),
      location_id: null,
      start_time: defaultStart.toISOString(),
    });
  };

  return (
    <Box display="flex" gap={1}>
      <Box>
        <ZUIButtonMenu
          items={[
            {
              icon: <Event />,
              label: messages.linkGroup.createEvent(),
              onClick: handleCreateEvent,
            },
            {
              icon: <HeadsetMic />,
              label: messages.linkGroup.createCallAssignment(),
              onClick: () =>
                createCallAssignment({
                  title: messages.form.createCallAssignment.newCallAssignment(),
                }),
            },
            {
              icon: <AssignmentOutlined />,
              label: messages.linkGroup.createSurvey(),
              onClick: () =>
                createSurvey({
                  signature: 'require_signature',
                  title: messages.form.createSurvey.newSurvey(),
                }),
            },
            {
              icon: <CheckBoxOutlined />,
              label: messages.linkGroup.createTask(),
              onClick: () => setCreateTaskDialogOpen(true),
            },
          ]}
          label={messages.linkGroup.createActivity()}
        />
      </Box>
      <Box>
        <ZUIEllipsisMenu
          items={[
            {
              id: CAMPAIGN_MENU_ITEMS.EDIT_CAMPAIGN,
              label: (
                <>
                  <Settings />
                  <Msg id={messageIds.form.edit} />
                </>
              ),
              onSelect: () => setEditCampaignDialogOpen(true),
            },
            {
              id: CAMPAIGN_MENU_ITEMS.DELETE_CAMPAIGN,
              label: (
                <>
                  <Delete />
                  <Msg id={messageIds.form.deleteCampaign.title} />
                </>
              ),
              onSelect: () => {
                showConfirmDialog({
                  onSubmit: deleteCampaign,
                  title: messages.form.deleteCampaign.title(),
                  warningText: messages.form.deleteCampaign.warning(),
                });
              },
            },
            {
              id: CAMPAIGN_MENU_ITEMS.SHOW_PUBLIC_PAGE,
              label: (
                <>
                  <OpenInNew />
                  <Link
                    color="inherit"
                    display="flex"
                    href={`https://www.zetk.in/o/${orgId}/campaigns/${campaign.id}`}
                    sx={{ alignItems: 'center', gap: 1 }}
                    target="_blank"
                    underline="none"
                  >
                    {<Msg id={messageIds.singleProject.showPublicPage} />}
                  </Link>
                </>
              ),
              onSelect: () => {
                // Do nothing, but without this, the menu will not close
              },
            },
          ]}
        />
      </Box>
      <ZUIDialog
        onClose={() => setEditCampaignDialogOpen(false)}
        open={editCampaignDialogOpen}
        title={messages.form.edit()}
      >
        <CampaignDetailsForm
          campaign={campaign}
          onCancel={() => setEditCampaignDialogOpen(false)}
          onSubmit={(data) => {
            updateCampaign({ ...data });
            setEditCampaignDialogOpen(false);
          }}
        />
      </ZUIDialog>
      <ZUIDialog
        onClose={() => {
          setCreateTaskDialogOpen(false);
        }}
        open={createTaskDialogOpen}
        title={messages.form.createTask.title()}
      >
        <CreateTaskDialogContent
          closeDialog={() => {
            setCreateTaskDialogOpen(false);
          }}
        />
      </ZUIDialog>
    </Box>
  );
};

export default CampaignActionButtons;
