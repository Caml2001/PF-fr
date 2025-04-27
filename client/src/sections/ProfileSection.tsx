import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  LogOut,
  ChevronRightIcon,
  CameraIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileReview, { ProfileData } from "../components/ProfileReview";
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../lib/api/profileService';

export default function ProfileSection() {
  // Cargar perfil real desde el backend
  const { data: profile, isLoading, error, refetch } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Cargando perfil...</div>;
  }
  if (error || !profile) {
    return <div className="p-8 text-center text-destructive">No se pudo cargar el perfil.</div>;
  }

  return (
    <ProfileReview profile={profile} onComplete={refetch} />
  );
}