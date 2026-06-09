import { useState, useCallback, useEffect } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Cat } from '../data/cats';
import { catImageUrl } from '../config/api';
import CatHeartButton from './CatHeartButton';
import './CatCarousel.css';

interface CatCarouselProps {
  cats: Cat[];
  onIndexChange?: (index: number) => void;
}

const CatCarousel = ({ cats, onIndexChange }: CatCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (next: number, dir: 'left' | 'right') => {
      if (animating || cats.length === 0) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setDirection(null);
        setAnimating(false);
        onIndexChange?.(next);
      }, 280);
    },
    [animating, cats.length, onIndexChange]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % cats.length, 'left');
  }, [current, cats.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + cats.length) % cats.length, 'right');
  }, [current, cats.length, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (cats.length === 0) return null;

  const cat = cats[current];
  const prevIndex = (current - 1 + cats.length) % cats.length;
  const nextIndex = (current + 1) % cats.length;

  const slideClass = direction
    ? `cat-card cat-card--slide-${direction}`
    : 'cat-card';

  return (
    <div className="cat-carousel">
      <div className="cat-carousel__deck">
        {cats.length > 1 && (
          <div className="cat-card cat-card--peek cat-card--peek-left" aria-hidden>
            <img src={catImageUrl(cats[prevIndex].image)} alt="" />
          </div>
        )}

        <div className={slideClass}>
          <div className="cat-card__image-wrap">
            <img src={catImageUrl(cat.image)} alt={cat.name} className="cat-card__image" />
          </div>
          <div className="cat-card__actions">
            <CatHeartButton catId={cat.id} />
          </div>
        </div>

        {cats.length > 1 && (
          <div className="cat-card cat-card--peek cat-card--peek-right" aria-hidden>
            <img src={catImageUrl(cats[nextIndex].image)} alt="" />
          </div>
        )}
      </div>

      <div className="cat-carousel__controls">
        <button
          type="button"
          className="cat-carousel__arrow"
          onClick={goPrev}
          aria-label="Previous cat"
        >
          <LeftOutlined />
        </button>

        {cats.length <= 12 && (
          <div className="cat-carousel__dots">
            {cats.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`cat-carousel__dot${i === current ? ' cat-carousel__dot--active' : ''}`}
                onClick={() => {
                  if (i !== current) goTo(i, i > current ? 'left' : 'right');
                }}
                aria-label={`Go to cat ${i + 1}`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          className="cat-carousel__arrow"
          onClick={goNext}
          aria-label="Next cat"
        >
          <RightOutlined />
        </button>
      </div>

      <p className="cat-carousel__counter">
        {current + 1} of {cats.length}
      </p>
    </div>
  );
};

export default CatCarousel;
