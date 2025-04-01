
import { Game } from '@/components/Game';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Game />
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>Spy Game &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
