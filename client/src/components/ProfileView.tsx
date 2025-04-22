import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, CreditCard, ShieldCheck, User, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cardLast4: string;
  verificationStatus: "verified" | "pending" | "unverified";
  curp: string;
}

// Mock data (en una aplicación real, esto vendría de una API)
const mockUserProfile: UserProfile = {
  fullName: "Juan Pérez López",
  email: "juan.perez@example.com",
  phone: "55 1234 5678",
  address: "Calle Principal #123, Col. Centro, CDMX",
  cardLast4: "4567",
  verificationStatus: "verified",
  curp: "PELJ850512HDFRZN02"
};

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editField, setEditField] = useState<keyof UserProfile | null>(null);
  const [fieldValue, setFieldValue] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleEditClick = (field: keyof UserProfile) => {
    setEditField(field);
    setFieldValue(profile[field]);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editField) {
      setProfile({
        ...profile,
        [editField]: fieldValue,
      });
    }
    setOpenEditDialog(false);
  };

  const getVerificationStatusBadge = (status: UserProfile["verificationStatus"]) => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center text-green-600 text-sm font-medium gap-1">
            <ShieldCheck size={16} />
            <span>Verificado</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center text-amber-600 text-sm font-medium gap-1">
            <ShieldCheck size={16} />
            <span>Pendiente</span>
          </div>
        );
      case "unverified":
        return (
          <div className="flex items-center text-red-600 text-sm font-medium gap-1">
            <ShieldCheck size={16} />
            <span>No verificado</span>
          </div>
        );
    }
  };

  const getFieldIcon = (field: keyof UserProfile) => {
    switch (field) {
      case "fullName":
        return <User size={18} />;
      case "email":
        return <Mail size={18} />;
      case "phone":
        return <Phone size={18} />;
      case "address":
        return <MapPin size={18} />;
      case "cardLast4":
        return <CreditCard size={18} />;
      default:
        return null;
    }
  };

  const getFieldLabel = (field: keyof UserProfile) => {
    switch (field) {
      case "fullName":
        return "Nombre completo";
      case "email":
        return "Correo electrónico";
      case "phone":
        return "Teléfono";
      case "address":
        return "Dirección";
      case "cardLast4":
        return "Tarjeta";
      case "curp":
        return "CURP";
      default:
        return field;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold">Mi Perfil</div>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{profile.fullName}</CardTitle>
                <CardDescription className="mt-1">
                  {getVerificationStatusBadge(profile.verificationStatus)}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teléfono */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={18} />
              <span>Teléfono</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{profile.phone}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick("phone")}
                className="h-8 w-8"
              >
                <Edit2 size={14} />
              </Button>
            </div>
          </div>
          <Separator />

          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={18} />
              <span>Correo electrónico</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{profile.email}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick("email")}
                className="h-8 w-8"
              >
                <Edit2 size={14} />
              </Button>
            </div>
          </div>
          <Separator />

          {/* Dirección */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={18} />
              <span>Dirección</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-right max-w-[180px] truncate">{profile.address}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick("address")}
                className="h-8 w-8"
              >
                <Edit2 size={14} />
              </Button>
            </div>
          </div>
          <Separator />

          {/* CURP */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={18} />
              <span>CURP</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{profile.curp}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Métodos de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard size={18} />
              <span>Tarjeta terminación {profile.cardLast4}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              <Edit2 size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Editar {editField ? getFieldLabel(editField) : ""}</DialogTitle>
            <DialogDescription>
              Actualiza la información de tu perfil
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-field">
                {editField ? getFieldLabel(editField) : ""}
              </Label>
              <div className="flex items-center space-x-2">
                {editField && getFieldIcon(editField)}
                <Input
                  id="edit-field"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" onClick={handleSaveEdit}>
              Guardar
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setOpenEditDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}