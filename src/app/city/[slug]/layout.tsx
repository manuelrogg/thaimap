// City layout hosts the `@panel` parallel slot used by the intercepted gym
// profile. `children` is the city view; `panel` is the gym profile overlay
// (or null via @panel/default.tsx when no gym is open).

export default function CityLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <>
      {children}
      {panel}
    </>
  );
}
