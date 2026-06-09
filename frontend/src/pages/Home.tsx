import { useNavigate } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import CatCarousel from '../components/CatCarousel';
import AnimaliaLogo from '../components/AnimaliaLogo';
import { useCats } from '../hooks/useCats';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { cats, loading, error } = useCats();

  return (
    <div className="home">
      <div className="home__inner">
        <section className="home__carousel-section">
          {loading ? (
            <div className="home__loading">
              <Spin size="large" />
            </div>
          ) : error ? (
            <p className="home__error">{error}</p>
          ) : cats.length === 0 ? (
            <p className="home__error">No cats available right now. Check back soon!</p>
          ) : (
            <CatCarousel cats={cats} />
          )}
        </section>

        <section className="home__cta-section">
          <div className="home__logo-wrap">
            <AnimaliaLogo size="lg" />
          </div>

          <h1 className="home__title">Find your new best friend</h1>
          <p className="home__subtitle">
            Browse our cats available for adoption at Animalia Welfare and More.
            Swipe through to meet each one — then continue when you're ready.
          </p>

          <Button
            type="primary"
            size="large"
            className="home__continue-btn"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => navigate('/apply')}
          >
            Continue
          </Button>

          <p className="home__staff-note">
            Already part of the Animalia team?{' '}
            <button
              type="button"
              className="home__staff-link"
              onClick={() => navigate('/staff/login')}
            >
              Staff login
            </button>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;
