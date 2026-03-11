import cloverImage from '../../assets/clover.png';

const particles = [
  { id: 1, left: '3%', size: 26, duration: '3.2s', delay: '0s', rotate: '-12deg' },
  { id: 2, left: '7%', size: 22, duration: '3.9s', delay: '0.3s', rotate: '9deg' },
  { id: 3, left: '11%', size: 34, duration: '4.2s', delay: '0.2s', rotate: '8deg' },
  { id: 4, left: '15%', size: 20, duration: '3.5s', delay: '0.6s', rotate: '-16deg' },
  { id: 5, left: '18%', size: 22, duration: '3.8s', delay: '0.6s', rotate: '-18deg' },
  { id: 6, left: '22%', size: 27, duration: '4s', delay: '0.4s', rotate: '11deg' },
  { id: 7, left: '25%', size: 30, duration: '4.5s', delay: '0.3s', rotate: '12deg' },
  { id: 8, left: '29%', size: 21, duration: '3.7s', delay: '0.9s', rotate: '-10deg' },
  { id: 9, left: '33%', size: 24, duration: '3.6s', delay: '0.8s', rotate: '-10deg' },
  { id: 10, left: '37%', size: 18, duration: '3.3s', delay: '0.5s', rotate: '14deg' },
  { id: 11, left: '41%', size: 36, duration: '4.7s', delay: '0.5s', rotate: '18deg' },
  { id: 12, left: '45%', size: 23, duration: '3.8s', delay: '0.2s', rotate: '-7deg' },
  { id: 13, left: '49%', size: 20, duration: '3.4s', delay: '0.1s', rotate: '-8deg' },
  { id: 14, left: '53%', size: 31, duration: '4.3s', delay: '0.7s', rotate: '13deg' },
  { id: 15, left: '57%', size: 28, duration: '4.1s', delay: '0.9s', rotate: '15deg' },
  { id: 16, left: '61%', size: 19, duration: '3.5s', delay: '0.4s', rotate: '-13deg' },
  { id: 17, left: '65%', size: 24, duration: '3.9s', delay: '0.7s', rotate: '-14deg' },
  { id: 18, left: '69%', size: 26, duration: '4.2s', delay: '0.3s', rotate: '8deg' },
  { id: 19, left: '73%', size: 32, duration: '4.8s', delay: '0.2s', rotate: '10deg' },
  { id: 20, left: '77%', size: 21, duration: '3.7s', delay: '0.6s', rotate: '-17deg' },
  { id: 21, left: '81%', size: 22, duration: '3.7s', delay: '1s', rotate: '-20deg' },
  { id: 22, left: '85%', size: 27, duration: '4s', delay: '0.5s', rotate: '12deg' },
  { id: 23, left: '90%', size: 30, duration: '4.4s', delay: '0.4s', rotate: '14deg' },
  { id: 24, left: '95%', size: 20, duration: '3.6s', delay: '0.8s', rotate: '-11deg' },
];

function CloverRain({ active }) {
  if (!active) return null;

  return (
    <div className="clover-rain" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="clover-rain-item"
          style={{
            '--left': particle.left,
            '--size': `${particle.size}px`,
            '--duration': particle.duration,
            '--delay': particle.delay,
            '--rotate': particle.rotate,
          }}
        >
          <img src={cloverImage} alt="" />
        </div>
      ))}
    </div>
  );
}

export default CloverRain;