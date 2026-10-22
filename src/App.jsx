import Header from './components/Header';
import Footer from './components/Footer';

function Hero() {
return (
<main className="main-content" id="inicio">
<section className="hero-section">
<div className="hero-container">

                <h2 className="hero-title">
                    Welcome to PyroBet
                </h2>

                <p className="hero-description">
                    Your sports prediction platform.
                    Earn points and dominate the global leaderboard.
                </p>

                <a href="#predicciones" className="hero-button">
                    Explore Predictions
                </a>

            </div>
        </section>
    </main>
);

}

function App() {
return (
<div className="app-container">
<Header />
<Hero />
<Footer />
</div>
);
}

export default App;