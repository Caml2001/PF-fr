import ProfileReview, { ProfileData } from "../components/ProfileReview";
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../lib/api/profileService';
import { PageContainer, ContentContainer, SectionHeader } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import TopNavMenu from "@/components/TopNavMenu";

export default function ProfileSection() {
  // Cargar perfil real desde el backend
  const { data: profile, isLoading, error, refetch } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return (
    <PageContainer>
      <ContentContainer>
        <SectionHeader 
          title="Tu perfil"
          subtitle="Revisa y actualiza tu información personal"
          action={
            (!window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone) ? <TopNavMenu /> : null
          }
        />

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {(error || !profile) && !isLoading ? (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-center text-destructive">
              No se pudo cargar el perfil.
            </CardContent>
          </Card>
        ) : null}

        {profile && !isLoading ? (
          <ProfileReview profile={profile} onComplete={refetch} />
        ) : null}
      </ContentContainer>
    </PageContainer>
  );
}
