import Container from "../components/Container";

export default function ClassesLoading() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] py-16 md:py-24">
      <Container>
        <div className="h-6 w-32 animate-pulse rounded bg-black/10" />
        <div className="mt-6 h-16 max-w-2xl animate-pulse rounded bg-black/10" />
        <div className="mt-14 h-64 animate-pulse rounded-2xl bg-black/10" />
      </Container>
    </main>
  );
}
