import ReviewClient from './ReviewClient.js';

export default function ReviewPage({ params }) {
  return <ReviewClient handId={params.handId} />;
}
