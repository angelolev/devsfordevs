import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col justify-center items-center font-mono px-4">
      <div className="w-full max-w-5xl bg-black rounded-lg shadow-lg p-8 m-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="h-4 w-4 bg-red-500 rounded-full"></span>
            <span className="h-4 w-4 bg-yellow-500 rounded-full"></span>
            <span className="h-4 w-4 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-sm">bash - DevConnect</span>
        </div>
        <div className="text-lg">
          <p className="text-green-400">$ npm start</p>
          <p>Starting DevConnect...</p>
          <br />
          <p className="text-green-400">$ echo "Welcome to DevConnect"</p>
          <p>Welcome to DevConnect</p>
          <br />
          <p className="text-green-400">$ cat about.txt</p>
          <p>
            A minimalistic social network built specifically for developers to
            share thoughts, code snippets, and connect with the community.
          </p>
          <br />
          <p className="text-green-400">$ ls /features</p>
          <ul className="list-disc list-inside">
            <li>OAuth Authentication</li>
            <li>Username Selection</li>
            <li>Notifications System</li>
            <li>Follow System</li>
            <li>Image Upload</li>
            <li>Dark/Light Theme</li>
            <li>Nested Comments</li>
            <li>Reactions</li>
            <li>Topic Filtering</li>
            <li>Responsive Design</li>
          </ul>
          <br />
          <p className="text-green-400">$</p>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/feed"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Enter DevConnect
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
