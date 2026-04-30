import { Link } from 'react-router-dom';
import PageState from '../components/PageState.jsx';

export default function NotFoundPage() {
  return (
    <div className="centered-page">
      <PageState
        title="That page is not here"
        message="The link you opened does not point to an active screen in this workspace."
        action={
          <Link className="button" to="/">
            Back to App
          </Link>
        }
      />
    </div>
  );
}
