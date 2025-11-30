import React, { useMemo } from 'react';
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ProfileData as ApiProfileData } from '../lib/api/profileService';

export type ProfileData = ApiProfileData;

interface ProfileReviewProps {
  profile: ProfileData;
  onComplete: () => void;
}

const displayValue = (value?: string | null) => value?.trim() || "No capturado";

const formatProper = (value?: string | null) => {
  if (!value) return "";
  return value
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const formatFullName = (data: ProfileData) => {
  const parts = [data.firstName, data.middleName, data.lastName, data.motherLastName]
    .map(part => formatProper(part))
    .filter(Boolean);
  return parts.join(" ");
};

const formatAddress = (data: ProfileData) => {
  const parts = [
    data.street,
    data.number,
    data.colonia,
    data.postalCode,
    data.municipality,
    data.state
  ].map(part => (part ? part.trim() : "")).filter(Boolean);
  return parts.join(", ");
};

export default function ProfileReview({ profile, onComplete: _onComplete }: ProfileReviewProps) {
  const fullName = useMemo(() => formatFullName(profile), [profile]);
  const address = useMemo(() => formatAddress(profile), [profile]);
  const initials = useMemo(() => {
    if (fullName) {
      return fullName
        .split(" ")
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
    }
    return "PF";
  }, [fullName]);

  const personalFields: { key: keyof ProfileData; label: string }[] = [
    { key: "firstName", label: "Primer nombre" },
    { key: "middleName", label: "Segundo nombre" },
    { key: "lastName", label: "Apellido paterno" },
    { key: "motherLastName", label: "Apellido materno" },
    { key: "curp", label: "CURP" },
  ];

  const addressFields: { key: keyof ProfileData; label: string }[] = [
    { key: "street", label: "Calle" },
    { key: "number", label: "Número" },
    { key: "colonia", label: "Colonia" },
    { key: "postalCode", label: "Código postal" },
    { key: "municipality", label: "Municipio/Alcaldía" },
    { key: "state", label: "Estado" },
  ];

  return (
    <div className="animate-in fade-in-50 duration-300 space-y-4">
      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Nombre completo</p>
            <h2 className="text-lg font-semibold">{fullName || "Completa tu nombre"}</h2>
              <p className="text-xs text-muted-foreground mt-1">
              CURP: {displayValue(profile.curp)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Datos personales</h3>
              <p className="text-sm text-muted-foreground">
                Solo lectura. Si algo está mal, repórtalo a soporte.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {personalFields.map((field) => (
                <div key={field.key} className={field.key === "curp" ? "col-span-2" : ""}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</p>
                  <div className="mt-1 rounded-md bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {field.key === "curp"
                      ? displayValue(profile[field.key] as string)
                      : formatProper(profile[field.key] as string)}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Dirección</p>
              <div className="rounded-md bg-muted/30 px-3 py-2 text-sm text-foreground">
                {address || "No capturada"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
