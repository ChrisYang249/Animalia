import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import AnimaliaLogo from '../components/AnimaliaLogo';
import './Apply.css';

const ApplyConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="apply">
      <div className="apply__card apply__card--centered">
        <AnimaliaLogo size="md" />
        <h1 className="apply__title">Thank you!</h1>
        <p className="apply__subtitle">
          We received your visit request. Someone from Animalia will be in touch soon to confirm
          your appointment.
        </p>
        <Button
          type="primary"
          size="large"
          className="apply__submit"
          onClick={() => navigate('/')}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default ApplyConfirmation;
