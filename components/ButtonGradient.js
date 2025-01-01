const ButtonGradient = ({
  title = "Gradient Button",
  onClick = () => {},
  disabled = false,
}) => {
  return (
    <button
      className={`btn font-semibold py-2 px-4 rounded-md transition-transform transform hover:scale-105
        ${
          disabled
            ? "opacity-50 cursor-not-allowed hidden"
            : "flex bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-gray-700 dark:to-gray-900 text-white dark:text-gray-100"
        }
      `}
      onClick={disabled ? undefined : onClick}
    >
      {title}
    </button>
  );
};

export default ButtonGradient;
