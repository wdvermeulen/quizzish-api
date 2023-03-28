export const Loader = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full shadow-xl transition-shadow motion-reduce:no-animation"></div>
      <span className="sr-only">Laden</span>
    </div>
  );
};

export const LoadingPage = () => {
  return (
    <>
      <div />
      <main className="hero overflow-auto">
        <div className="hero-body px-2">
          <Loader />
        </div>
      </main>
    </>
  );
};
