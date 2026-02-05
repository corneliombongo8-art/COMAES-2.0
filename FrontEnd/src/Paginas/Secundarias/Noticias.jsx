import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { 
  Newspaper, TrendingUp, Calendar, User, Clock, 
  ExternalLink, BookOpen, Trophy, Zap, Share2,
  Bookmark, BookmarkCheck, Filter, Search, Eye
} from 'lucide-react';

// Componente Card de Notícia
const NewsCard = ({ 
  id,
  category, 
  title, 
  excerpt, 
  author, 
  date, 
  readTime, 
  views,
  isBookmarked,
  onBookmark,
  imageUrl,
  tags = []
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200">
    {/* Imagem da Notícia */}
    {imageUrl && (
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    
    <div className="p-6">
      {/* Categoria e Ações */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            category === 'novidade' ? 'bg-blue-100 text-blue-800' :
            category === 'atualização' ? 'bg-green-100 text-green-800' :
            category === 'evento' ? 'bg-purple-100 text-purple-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {category === 'novidade' ? '🎉 Novidade' :
             category === 'atualização' ? '🔄 Atualização' :
             category === 'evento' ? '📅 Evento' : '💡 Dica'}
          </span>
          
          {tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <button 
          onClick={() => onBookmark(id)}
          className="text-gray-400 hover:text-yellow-500 transition-colors"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-yellow-500" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Título e Resumo */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{excerpt}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta informações */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <User className="h-4 w-4" />
            <span>{author}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Clock className="h-4 w-4" />
            <span>{readTime}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Eye className="h-4 w-4" />
            <span>{views} visualizações</span>
          </div>
          
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
            <span>Ler mais</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Componente Card de Destaque
const FeaturedCard = ({ 
  title, 
  description, 
  imageUrl, 
  type = 'featured',
  ctaText = 'Saiba mais' 
}) => {
  const getTypeStyle = () => {
    switch(type) {
      case 'announcement':
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
      case 'event':
        return 'bg-gradient-to-r from-green-500 to-teal-600';
      case 'update':
        return 'bg-gradient-to-r from-orange-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden text-white ${getTypeStyle()}`}>
      <div className="p-8">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-6 w-6" />
          <span className="font-medium">DESTAQUE</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="mb-6 opacity-90">{description}</p>
        
        <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          {ctaText}
        </button>
      </div>
    </div>
  );
};

// Componente Card de Anúncio Rápido
const QuickUpdateCard = ({ icon: Icon, title, description, date, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default function News() {
  const [news, setNews] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    { id: 'all', label: 'Todas', count: 0 },
    { id: 'novidade', label: 'Novidades', count: 0 },
    { id: 'atualização', label: 'Atualizações', count: 0 },
    { id: 'evento', label: 'Eventos', count: 0 },
    { id: 'dica', label: 'Dicas', count: 0 }
  ]);

  // Carregar notícias
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/noticias');
        const result = await response.json();
        
        if (result.success) {
          const transformedNews = result.data.map(item => {
            // Determinar categoria com base nas tags ou padrão
            let category = 'novidade';
            if (item.tags) {
              const tagsArr = Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]');
              if (tagsArr.some(t => t.toLowerCase().includes('evento'))) category = 'evento';
              else if (tagsArr.some(t => t.toLowerCase().includes('atualização') || t.toLowerCase().includes('update'))) category = 'atualização';
              else if (tagsArr.some(t => t.toLowerCase().includes('dica'))) category = 'dica';
            }

            return {
              id: item.id,
              category,
              title: item.titulo,
              excerpt: item.resumo || item.conteudo.substring(0, 150) + '...',
              author: item.usuario?.nome || 'Equipe COMAES',
              date: item.publicado_em ? new Date(item.publicado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recentemente',
              readTime: Math.ceil(item.conteudo.split(' ').length / 200) + ' min',
              views: Math.floor(Math.random() * 1000) + 100, // Simulado se não houver no banco
              isBookmarked: false,
              imageUrl: item.url_capa || 'https://images.unsplash.com/photo-1504711432869-5d39a110fdd7?auto=format&fit=crop&w=800',
              tags: Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]')
            };
          });

          setNews(transformedNews);
          
          // Atualizar contadores de categorias
          const counts = {
            all: transformedNews.length,
            novidade: transformedNews.filter(n => n.category === 'novidade').length,
            atualização: transformedNews.filter(n => n.category === 'atualização').length,
            evento: transformedNews.filter(n => n.category === 'evento').length,
            dica: transformedNews.filter(n => n.category === 'dica').length,
          };

          setCategories(prev => prev.map(cat => ({
            ...cat,
            count: counts[cat.id] || 0
          })));
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Filtrar notícias
  const filteredNews = news.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Alternar bookmark
  const toggleBookmark = (id) => {
    if (bookmarked.includes(id)) {
      setBookmarked(bookmarked.filter(item => item !== id));
      setNews(news.map(item => 
        item.id === id ? { ...item, isBookmarked: false } : item
      ));
    } else {
      setBookmarked([...bookmarked, id]);
      setNews(news.map(item => 
        item.id === id ? { ...item, isBookmarked: true } : item
      ));
    }
  };

  // Notícias em destaque dinâmicas
  const featuredNews = news
    .filter(n => n.tags.some(t => t.toLowerCase().includes('destaque') || t.toLowerCase().includes('featured')))
    .slice(0, 2);
  
  // Fallback se não houver marcadas como destaque
  const displayFeatured = featuredNews.length > 0 ? featuredNews : news.slice(0, 2);

  // Atualizações rápidas dinâmicas
  const quickUpdates = news
    .filter(n => n.category === 'atualização' || n.category === 'novidade')
    .slice(0, 3)
    .map(n => ({
      icon: n.category === 'atualização' ? TrendingUp : Zap,
      title: n.title,
      description: n.excerpt.substring(0, 60) + '...',
      date: n.date,
      color: n.category === 'atualização' ? 'blue' : 'green'
    }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notícias...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Newspaper className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Notícias da Plataforma</h2>
              <p className="text-gray-600 mt-1">Fique por dentro das novidades, atualizações e eventos</p>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Pesquisar notícias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Filtrar:</span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destaques */}
        {displayFeatured.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {displayFeatured.map((featured) => (
              <FeaturedCard 
                key={featured.id} 
                title={featured.title}
                description={featured.excerpt}
                imageUrl={featured.imageUrl}
                type={featured.category === 'evento' ? 'event' : 'featured'}
              />
            ))}
          </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Notícias */}
          <div className="lg:col-span-2">
            {/* Cabeçalho das Notícias */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {filter === 'all' ? 'Todas as Notícias' : 
                 filter === 'novidade' ? 'Novidades' :
                 filter === 'atualização' ? 'Atualizações' :
                 filter === 'evento' ? 'Eventos' : 'Dicas'}
                <span className="text-gray-400 ml-2">({filteredNews.length})</span>
              </h3>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Compartilhar</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">{bookmarked.length} salvos</span>
                </div>
              </div>
            </div>

            {/* Lista de Notícias */}
            <div className="space-y-6">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    {...item}
                    isBookmarked={bookmarked.includes(item.id)}
                    onBookmark={toggleBookmark}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notícia encontrada</h4>
                  <p className="text-gray-600">Tente alterar os filtros ou termos de busca</p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {filteredNews.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <span className="px-2 text-gray-500">...</span>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Atualizações Rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Atualizações Recentes</h3>
              </div>
              
              <div className="space-y-4">
                {quickUpdates.map((update, index) => (
                  <QuickUpdateCard key={index} {...update} />
                ))}
              </div>
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h3>
              
              <div className="space-y-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      filter === cat.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${
                        cat.id === 'novidade' ? 'bg-blue-100' :
                        cat.id === 'atualização' ? 'bg-green-100' :
                        cat.id === 'evento' ? 'bg-purple-100' :
                        'bg-yellow-100'
                      }`}>
                        {cat.id === 'novidade' ? '🎉' :
                         cat.id === 'atualização' ? '🔄' :
                         cat.id === 'evento' ? '📅' : '💡'}
                      </div>
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notícias Mais Vistas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mais Populares</h3>
              
              <div className="space-y-4">
                {news
                  .sort((a, b) => parseInt(b.views) - parseInt(a.views))
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{item.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Eye className="h-3 w-3" />
                          <span>{item.views}</span>
                          <Clock className="h-3 w-3" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Receba Novidades</h3>
              <p className="text-blue-100 mb-4">Inscreva-se para receber as principais notícias por email</p>
              
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900"
                />
                <button className="w-full py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}