"use client";

type DashboardFormProps = {
  user: {
    name: string;
    created_at?: string;
    // ggf. weitere Felder
  };
};

export default function DashboardForm({ user }: DashboardFormProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dein Dashboard</h1>
      <p>Hallo {user.name}</p>
      <p>Mitglied seit: {user.created_at?.slice(0, 10) ?? "unbekannt"}</p>
    </div>
  );
}
