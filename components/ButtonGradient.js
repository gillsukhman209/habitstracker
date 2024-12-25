const ButtonGradient = ({
  title = "Gradient Button",
  onClick = () => {},
  disabled = false,
}) => {
  return (
    <button
      className={`btn bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition-transform transform hover:scale-105 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};

export default ButtonGradient;
