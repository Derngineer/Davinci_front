import solvingImg from '../assets/solving.svg';
import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="container">
        <div className="how-inner">

          {/* ── Left: image ── */}
          <div className="how-image-wrap">
            <img src={solvingImg} alt="DaVinci solving a problem" className="how-image" />
          </div>

          {/* ── Right: steps ── */}
          <div className="how-content">
            <h2 className="how-title">Homework solved in 3&nbsp;taps</h2>
            <p className="how-subtitle">
              No typing equations. No searching. Just point your phone and solve.
            </p>

            <div className="steps-col">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-text">
                  <h3>Open Camera</h3>
                  <p>Launch DaVinci on your phone. The camera opens instantly ready to capture.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">2</div>
                <div className="step-text">
                  <h3>Snap the Problem</h3>
                  <p>Take a photo of any homework problem — handwritten or printed, any language.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">3</div>
                <div className="step-text">
                  <h3>Get the Solution</h3>
                  <p>AI reads the problem and delivers a detailed, step-by-step solution in seconds.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
