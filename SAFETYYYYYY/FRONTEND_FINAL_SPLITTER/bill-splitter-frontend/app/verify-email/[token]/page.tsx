import VerifyEmailClient from './verify-email-client';

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  return <VerifyEmailClient token={resolvedParams.token} />;
}
