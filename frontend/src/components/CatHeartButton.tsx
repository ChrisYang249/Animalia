import { useState, useCallback, type CSSProperties } from 'react';
import { useLikedCatsStore } from '../store/likedCatsStore';
import './CatHeartButton.css';

interface CatHeartButtonProps {
  catId: number;
}

const BURST_COUNT = 8;

const CatHeartButton = ({ catId }: CatHeartButtonProps) => {
  const { isLiked, toggleLike } = useLikedCatsStore();
  const liked = isLiked(catId);
  const [bursting, setBursting] = useState(false);
  const [popping, setPopping] = useState(false);

  const handleClick = useCallback(() => {
    const willLike = !liked;
    toggleLike(catId);

    if (willLike) {
      setBursting(true);
      setPopping(true);
      setTimeout(() => setBursting(false), 700);
      setTimeout(() => setPopping(false), 450);
    }
  }, [catId, liked, toggleLike]);

  return (
    <div className="cat-heart">
      {bursting && (
        <>
          <span className="cat-heart__ring" aria-hidden />
          {Array.from({ length: BURST_COUNT }).map((_, i) => (
            <span
              key={i}
              className="cat-heart__particle"
              style={{ '--i': i } as CSSProperties}
              aria-hidden
            />
          ))}
        </>
      )}

      <button
        type="button"
        className={`cat-heart__btn${liked ? ' cat-heart__btn--liked' : ''}${popping ? ' cat-heart__btn--pop' : ''}`}
        onClick={handleClick}
        aria-label={liked ? 'Unlike this cat' : 'Like this cat'}
        aria-pressed={liked}
      >
        <svg
          className="cat-heart__icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default CatHeartButton;
