const Loader = () => {
  return (
    <div className="w-full min-h-screen h-[100dvh] sm:h-screen flex items-center justify-center fixed top-0 left-0 bg-white z-50 p-4 sm:p-6">
      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
