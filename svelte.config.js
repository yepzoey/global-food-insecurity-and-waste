import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

export default {
  kit: {
    adapter: adapter({
      fallback: '404.html',
    }),
    paths: {
      base: dev ? '' : '/global-food-insecurity-and-waste',
    }
  },
};
