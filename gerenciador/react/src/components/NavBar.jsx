import { Disclosure } from '@headlessui/react';
import { Menu, LogOut, Home, FilePlus, Wrench, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import logoDark from './assets/logo_dark.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Home', 
      current: false, 
      href: '/', 
      icon: Home 
    },
    { 
      name: 'Registrar novo arquivo', 
      current: false, 
      href: '/newPost', 
      icon: FilePlus 
    },
    { 
      name: 'Ferramentas e Licenças', 
      current: false, 
      href: '/tools', 
      icon: Wrench 
    },
    { 
      name: 'Treinamentos', 
      current: false, 
      href: '/training', 
      icon: GraduationCap 
    }
  ];

  return (
    <Disclosure as="nav" className="bg-gray-800 py-4 shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <Menu className="block h-6 w-6 text-white" />
                  ) : (
                    <Menu className="block h-6 w-6 text-white" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <Link
                  to="/"
                  className="flex-shrink-0 flex items-center text-white hover:text-gray-300 transition duration-200"
                >
                  <img 
                    className="block h-8 w-auto rounded-md" 
                    src={logoDark} 
                    alt="DMS" 
                  />
                  <h1 className="text-2xl font-bold text-white ml-3 tracking-tight">
                    Gerenciador de Arquivos
                  </h1>
                </Link>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition duration-200 group'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          <IconComponent 
                            className="h-5 w-5 text-gray-400 group-hover:text-white transition duration-200" 
                          />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-300 hover:text-white transition duration-200 group"
                >
                  <LogOut
                    className="h-5 w-5 mr-2 text-gray-400 group-hover:text-white transition duration-200" 
                  />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition duration-200'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <IconComponent className="h-5 w-5 text-gray-400" />
                    <span>{item.name}</span>
                  </Disclosure.Button>
                );
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}