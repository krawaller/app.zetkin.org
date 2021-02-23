import { dehydrate } from 'react-query/hydration';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { Button, Flex, Heading, Link, Text } from '@adobe/react-spectrum';
import { QueryClient, useQuery } from 'react-query';

import getEvent from '../../../../fetching/getEvent';
import getOrg from '../../../../fetching/getOrg';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const queryClient = new QueryClient();
    const { orgId, eventId } = context.params;

    await queryClient.prefetchQuery(['event', eventId], getEvent(orgId as string, eventId as string));
    await queryClient.prefetchQuery(['org', orgId], getOrg(orgId as string));

    const eventState = queryClient.getQueryState(['event', eventId]);
    const orgState = queryClient.getQueryState(['org', orgId]);

    if (eventState.status === 'success' && orgState.status === 'success') {
        return {
            props: {
                dehydratedState: dehydrate(queryClient),
                eventId,
                orgId,
            },
        };
    }
    else {
        return {
            notFound: true,
        };
    }
};

type OrgEventPageProps = {
    eventId: string;
    orgId: string;
};

export default function OrgEventPage(props : OrgEventPageProps) : JSX.Element {
    const { orgId, eventId } = props;
    const eventQuery = useQuery(['event', eventId], getEvent(orgId, eventId));
    const orgQuery = useQuery(['org', orgId], getOrg(orgId));

    return (
        <Flex direction="column">
            <Heading data-test="event-title" level={ 1 }>
                { eventQuery.data.title ? eventQuery.data.title : eventQuery.data.activity.title }
            </Heading>
            <Flex>
                <Text marginEnd="size-50">
                    Organization:
                </Text>
                <Link>
                    <NextLink href={ `/o/${orgId}` }>
                        <a>{ orgQuery.data.title }</a>
                    </NextLink>
                </Link>
            </Flex>
            <Flex>
                <Text marginEnd="size-50">
                    Campaign:
                </Text>
                <Link>
                    <NextLink href={ `/o/${orgId}/campaigns/${eventQuery.data.campaign.id}` }>
                        <a>{ eventQuery.data.campaign.title }</a>
                    </NextLink>
                </Link>
            </Flex>
            <Flex>
                <Text marginEnd="size-50">
                    Start:
                </Text>
                <Text data-test="start-time">
                    { eventQuery.data.start_time }
                </Text>
            </Flex>
            <Flex>
                <Text marginEnd="size-50">
                    End:
                </Text>
                <Text data-test="end-time">
                    { eventQuery.data.end_time }
                </Text>
            </Flex>
            <Flex>
                <Text marginEnd="size-50">
                    Information:
                </Text>
                <Text data-test="info-text">
                    { eventQuery.data.info_text }
                </Text>
            </Flex>
            <Flex>
                <Text marginEnd="size-50">
                    Location:
                </Text>
                <Text data-test="location">
                    { eventQuery.data.location.title }
                </Text>
            </Flex>
            <Button data-test="sign-up-button" marginY="size-200" variant="cta">
                Sign-up
            </Button>
        </Flex>
    );
}