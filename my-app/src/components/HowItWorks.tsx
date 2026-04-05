import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="container">
        <h2 className="section-title">Homework solved in 3 taps</h2>
        <p className="section-subtitle">No typing equations. No searching. Just point your phone and solve.</p>
        <div className="steps-row">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Open Camera</h3>
            <p>Launch DaVinci on your phone. The camera opens instantly ready to capture.</p>
          </div>
          <div className="step-divider" />
          <div className="step">
            <div className="step-num">2</div>
            <h3>Snap the Problem</h3>
            <p>Take a photo of any homework problem — handwritten or printed, any language.</p>
          </div>
          <div className="step-divider" />
          <div className="step">
            <div className="step-num">3</div>
            <h3>Get the Solution</h3>
            <p>AI reads the problem and delivers a detailed, step-by-step solution in seconds.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
