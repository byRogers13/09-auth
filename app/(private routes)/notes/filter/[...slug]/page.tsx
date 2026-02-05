import { fetchNotes } from '@/lib/api';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import NotesClient from './Notes.client';
import { Metadata } from 'next';
import { ALL_TAG, BASE_URL } from '@/lib/config/constants';

interface Props {
    params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const filter = slug?.[0] || 'all';
    const title = `Notes: ${filter}`;
    const description = `Notes filtered by "${filter}"`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/notes/filter/${filter}`,
            images: [
                {
                    url: '/notehub-og.jpg',
                    width: 1200,
                    height: 630,
                    alt: 'NoteHub',
                },
            ],
        },
    };
}

const NotesByCategory = async ({ params }: Props) => {
    const { slug } = await params;
    const tag = slug[0] === ALL_TAG ? undefined : slug[0];

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['notes', { page: 1, tag }],
        queryFn: () => fetchNotes('', 1, tag),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NotesClient tag={tag} />
        </HydrationBoundary>
    );
};

export default NotesByCategory;