'use client';

import React, { Component } from 'react';
import { useRouter } from 'next/navigation';

type RouterType = ReturnType<typeof useRouter>;

interface Props {
  router: RouterType;
}

interface State {
  name: string;
  email: string;
  password: string;
}

class IncidentLogin extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as Pick<State, keyof State>);
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password } = this.state;

    if (name && email && password) {
      this.props.router.push('/data');
    } else {
      alert('Please fill in all fields.');
    }
  };

  render() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 animate-fade-in-down">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Incident Login</h2>
          <form onSubmit={this.handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={this.handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={this.handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={this.handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-all duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }
}

export default IncidentLogin;
