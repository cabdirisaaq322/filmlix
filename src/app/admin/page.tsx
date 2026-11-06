'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPanel } from '@/components/AdminPanel';
import { isAdmin, getCurrentUser, onAuthStateChange } from '@/lib/auth';

export default function AdminPage() {
  const [user, setUser] = useState(getCurrentUser());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChange((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <AdminLogin
          onSuccess={() => {
            router.replace(pathname);
          }}
        />
      </div>
    );
  }

  return <AdminPanel />;
}
