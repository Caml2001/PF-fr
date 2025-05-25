import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useUpdateProfile } from '../hooks/useUpdateProfile';

export interface ProfileData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  motherLastName?: string;
  curp?: string;
  street?: string;
  number?: string;
  colonia?: string;
  municipality?: string;
  state?: string;
  postalCode?: string;
  ineClaveElector?: string;
  ineIssueDate?: string;
  ineExpirationDate?: string;
}

interface ProfileReviewProps {
  profile: ProfileData;
  onComplete: () => void;
}

export default function ProfileReview({ profile, onComplete }: ProfileReviewProps) {
  const [editData, setEditData] = useState<ProfileData>(profile);
  const [editing, setEditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateProfile();

  const handleChange = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditData(profile);
    setEditing(false);
    setApiError(null);
  };

  const handleSave = () => {
    setApiError(null);
    updateProfileMutation.mutate(editData, {
      onSuccess: (updatedData) => {
        // Actualizar el estado local con los datos del servidor
        setEditData(updatedData);
        setEditing(false);
        onComplete();
      },
      onError: (err: any) => {
        setApiError(err?.response?.data?.error || err?.message || "Error al actualizar el perfil.");
      }
    });
  };

  return (
    <div className="animate-in fade-in-50 duration-300 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-primary mb-4 text-center">Revisa tus datos</h2>
      <p className="text-muted-foreground text-sm mb-6 text-center">
        Por favor confirma que tu información es correcta. Si necesitas cambiar algo, hazlo aquí.
      </p>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
          {apiError}
        </div>
      )}

      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Primer Nombre</Label>
              <Input id="firstName" value={editData.firstName || ''} disabled={!editing} onChange={e => handleChange('firstName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="middleName">Segundo Nombre</Label>
              <Input id="middleName" value={editData.middleName || ''} disabled={!editing} onChange={e => handleChange('middleName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="motherLastName">Apellido Materno</Label>
              <Input id="motherLastName" value={editData.motherLastName || ''} disabled={!editing} onChange={e => handleChange('motherLastName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido Paterno</Label>
              <Input id="lastName" value={editData.lastName || ''} disabled={!editing} onChange={e => handleChange('lastName', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="curp">CURP</Label>
              <Input id="curp" value={editData.curp || ''} disabled={!editing} onChange={e => handleChange('curp', e.target.value)} className="w-full" maxLength={18} />
            </div>
            <div>
              <Label htmlFor="street">Calle</Label>
              <Input id="street" value={editData.street || ''} disabled={!editing} onChange={e => handleChange('street', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" value={editData.number || ''} disabled={!editing} onChange={e => handleChange('number', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="colonia">Colonia</Label>
              <Input id="colonia" value={editData.colonia || ''} disabled={!editing} onChange={e => handleChange('colonia', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="municipality">Municipio/Alcaldía</Label>
              <Input id="municipality" value={editData.municipality || ''} disabled={!editing} onChange={e => handleChange('municipality', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" value={editData.state || ''} disabled={!editing} onChange={e => handleChange('state', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input id="postalCode" value={editData.postalCode || ''} disabled={!editing} onChange={e => handleChange('postalCode', e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primer Nombre</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground">{editData.firstName || ''}</div>
            </div>
            <div>
              <Label>Segundo Nombre</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground">{editData.middleName || ''}</div>
            </div>
            <div>
              <Label>Apellido Materno</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground">{editData.motherLastName || ''}</div>
            </div>
            <div>
              <Label>Apellido Paterno</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground">{editData.lastName || ''}</div>
            </div>
            <div className="col-span-2">
              <Label>CURP</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground break-all">{editData.curp || ''}</div>
            </div>
            <div className="col-span-2">
              <Label>Dirección</Label>
              <div className="bg-accent rounded px-3 py-2 text-muted-foreground">
                {[
                  editData.street,
                  editData.number,
                  editData.colonia,
                  editData.postalCode,
                  editData.municipality,
                  editData.state
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 mt-8">
          {editing ? (
            <>
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleCancel} disabled={updateProfileMutation.isPending}>Cancelar</Button>
              <Button type="submit" className="flex-1 h-12" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </>
          ) : null}
        </div>
        {!editing && (
          <div className="flex justify-end mt-2">
            <button
              type="button"
              className="text-primary underline text-sm font-medium hover:opacity-80 transition"
              onClick={handleEdit}
            >
              Editar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
