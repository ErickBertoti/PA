import { Disclosure } from '@headlessui/react';
import { Menu, LogOut, Home, FilePlus, Wrench, GraduationCap, X, User as UserIcon, Bell } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import logoDark from './assets/logo_dark.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    fetchUserName();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
      localStorage.removeItem('token');
      navigate('/login');
    }, 300);
  };

  const navigation = [
    { 
      name: 'Home', 
      current: location.pathname === '/', 
      href: '/', 
      icon: Home,
      color: 'hover:text-blue-400',
      bgColor: 'bg-blue-500'
    },
    { 
      name: 'Ferramentas e Licenças', 
      current: location.pathname === '/tools', 
      href: '/tools', 
      icon: Wrench,
      color: 'hover:text-yellow-400',
      bgColor: 'bg-yellow-500'
    },
    { 
      name: 'Treinamentos', 
      current: location.pathname === '/training', 
      href: '/training', 
      icon: GraduationCap,
      color: 'hover:text-purple-400',
      bgColor: 'bg-purple-500'
    }
  ];

  return (
    <Disclosure as="nav" 
      className={classNames(
        'fixed w-full top-0 z-50 transition-all duration-500',
        scrolled 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-lg shadow-xl shadow-gray-900/10' 
          : 'bg-gradient-to-r from-gray-900 to-gray-800'
      )}
    >
      {({ open }) => (
        <>
          {/* Efeito de brilho decorativo */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[150px] -left-[100px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-[150px] -right-[100px] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="relative flex items-center justify-between h-16">
              {/* Botão Mobile */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button 
                  className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-300 active:scale-95"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-6 w-6 text-white transform transition-transform duration-300" />
                  ) : (
                    <Menu className="block h-6 w-6 text-white transform transition-transform duration-300" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Nome da aplicação */}
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <Link
                  to="/"
                  className="flex-shrink-0 flex items-center text-white group transition-all duration-300 hover:scale-105"
                >
                  <div className="relative overflow-hidden rounded-xl p-1.5 bg-white/10 backdrop-blur-sm mr-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <FilePlus className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 tracking-tight relative">
                    Gerenciador de Arquivos
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                  </h1>
                </Link>

                {/* Desktop */}
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-2">
                    {navigation.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onMouseEnter={() => setHoveredItem(item.name)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={classNames(
                            'px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all duration-300',
                            'hover:bg-white/10 relative group backdrop-blur-sm',
                            item.current 
                              ? 'bg-white/15 text-white shadow-lg' 
                              : 'text-gray-300 hover:text-white'
                          )}
                        >
                          <div className={classNames(
                            'p-1.5 rounded-lg transition-all duration-300',
                            item.current ? item.bgColor : 'bg-gray-700/50',
                            hoveredItem === item.name ? 'scale-110' : 'scale-100'
                          )}>
                            <IconComponent 
                              className={classNames(
                                'h-4 w-4 transition-all duration-300',
                                item.current ? 'text-white' : 'text-gray-300'
                              )}
                            />
                          </div>
                          <span>{item.name}</span>
                          
                          {/* Animação da Underline */}
                          <span 
                            className={classNames(
                              'absolute bottom-0 left-0 h-0.5 transition-all duration-300 rounded-full',
                              item.color.replace('hover:', ''),
                              hoveredItem === item.name || item.current ? 'w-full' : 'w-0'
                            )}
                          />
                          
                          {/* Efeito de brilho no hover */}
                          <span 
                            className={classNames(
                              'absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-300',
                              `from-${item.color.split('-')[1]}-400/10 to-transparent`,
                              hoveredItem === item.name ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Info do usuário e Logout */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                    <div className="p-1.5 bg-indigo-500/50 rounded-lg">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-200 font-medium">
                      {userName || 'Usuário'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group active:scale-95"
                  >
                    <div className="p-1.5 bg-red-500/50 rounded-lg mr-2">
                      <LogOut
                        className="h-4 w-4 text-white transform transition-transform duration-300 group-hover:translate-x-0.5" 
                      />
                    </div>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <Disclosure.Panel className="sm:hidden">
            <div className="px-3 pt-2 pb-3 space-y-1.5 backdrop-blur-sm">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      'w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-base font-medium',
                      'transition-all duration-300 transform hover:scale-[1.02]',
                      item.current 
                        ? 'bg-white/15 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className={classNames(
                      'p-1.5 rounded-lg transition-all duration-300',
                      item.current ? item.bgColor : 'bg-gray-700/50'
                    )}>
                      <IconComponent className={classNames(
                        'h-5 w-5 transition-colors duration-300',
                        item.current ? 'text-white' : 'text-gray-300'
                      )} />
                    </div>
                    <span>{item.name}</span>
                    
                    {/* Indicador de item atual */}
                    {item.current && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </Disclosure.Button>
                );
              })}
              
              {/* Botão de logout para mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-base font-medium text-gray-300 hover:bg-red-500/20 hover:text-white transition-all duration-300"
              >
                <div className="p-1.5 bg-red-500/50 rounded-lg">
                  <LogOut className="h-5 w-5 text-white" />
                </div>
                <span>Logout</span>
              </button>
            </div>
          </Disclosure.Panel>
          
          {/* Estilos para animações */}
          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-out {
              opacity: 0;
              transition: opacity 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </Disclosure>
  );
}
