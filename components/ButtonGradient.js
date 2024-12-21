const ButtonGradient = ({
  title = "Gradient Button",
  onClick = () => {},
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-gradient animate-shimmber ${
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
