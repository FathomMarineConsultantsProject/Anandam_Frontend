import cloverImage from '../../assets/clover.png';

const particles = [
  /* extra large */
  { id: 1, left: '60%', size: '16vw', duration: '6.8s', delay: '0.3s', rotate: '10deg', drift: '18px' },

  /* large */
  { id: 2, left: '24%', size: '10vw', duration: '6.0s', delay: '0.9s', rotate: '-12deg', drift: '-20px' },
  { id: 3, left: '86%', size: '9vw', duration: '5.8s', delay: '1.6s', rotate: '14deg', drift: '18px' },

  /* medium */
  { id: 4, left: '6%', size: '42px', duration: '5.0s', delay: '0.0s', rotate: '-8deg', drift: '-10px' },
  { id: 5, left: '18%', size: '34px', duration: '5.1s', delay: '0.7s', rotate: '9deg', drift: '12px' },
  { id: 6, left: '33%', size: '38px', duration: '5.2s', delay: '1.3s', rotate: '-10deg', drift: '-12px' },
  { id: 7, left: '46%', size: '46px', duration: '5.4s', delay: '2.0s', rotate: '11deg', drift: '14px' },
  { id: 8, left: '55%', size: '32px', duration: '5.0s', delay: '2.6s', rotate: '-9deg', drift: '-10px' },
  { id: 9, left: '70%', size: '36px', duration: '5.3s', delay: '3.1s', rotate: '13deg', drift: '12px' },
  { id: 10, left: '79%', size: '30px', duration: '5.1s', delay: '3.7s', rotate: '-11deg', drift: '-11px' },
  { id: 11, left: '93%', size: '34px', duration: '5.2s', delay: '4.3s', rotate: '10deg', drift: '10px' },

  /* small */
  { id: 12, left: '4%', size: '16px', duration: '4.2s', delay: '0.4s', rotate: '8deg', drift: '8px' },
  { id: 13, left: '10%', size: '18px', duration: '4.0s', delay: '1.0s', rotate: '-7deg', drift: '-6px' },
  { id: 14, left: '15%', size: '14px', duration: '4.1s', delay: '1.5s', rotate: '10deg', drift: '7px' },
  { id: 15, left: '27%', size: '20px', duration: '4.3s', delay: '2.1s', rotate: '-11deg', drift: '-7px' },
  { id: 16, left: '38%', size: '15px', duration: '4.0s', delay: '2.8s', rotate: '9deg', drift: '6px' },
  { id: 17, left: '42%', size: '18px', duration: '4.2s', delay: '3.4s', rotate: '-9deg', drift: '-6px' },
  { id: 18, left: '50%', size: '16px', duration: '4.1s', delay: '3.9s', rotate: '8deg', drift: '6px' },
  { id: 19, left: '58%', size: '14px', duration: '4.0s', delay: '4.4s', rotate: '-8deg', drift: '-6px' },
  { id: 20, left: '64%', size: '18px', duration: '4.3s', delay: '4.9s', rotate: '12deg', drift: '7px' },
  { id: 21, left: '74%', size: '15px', duration: '4.1s', delay: '5.2s', rotate: '-10deg', drift: '-6px' },
  { id: 22, left: '82%', size: '17px', duration: '4.2s', delay: '5.5s', rotate: '10deg', drift: '7px' },
  { id: 23, left: '89%', size: '14px', duration: '4.0s', delay: '5.9s', rotate: '-9deg', drift: '-5px' },
  { id: 24, left: '97%', size: '16px', duration: '4.1s', delay: '6.2s', rotate: '8deg', drift: '6px' },
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
            '--size': particle.size,
            '--duration': particle.duration,
            '--delay': particle.delay,
            '--rotate': particle.rotate,
            '--drift': particle.drift,
          }}
        >
          <img src={cloverImage} alt="" />
        </div>
      ))}
    </div>
  );
}

export default CloverRain;