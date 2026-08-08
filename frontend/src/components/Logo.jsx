import logoImg from '../assets/logo.png';

export default function Logo({ size = 40 }) {
  return (
    <img
      src={logoImg}
      alt="PrepWise AI"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
