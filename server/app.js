const app = new Vue({
    el: '#app',
    data: {
      url: '',
      slug: '',
      error: '',
      formVisible: true,
      created: null,
    },
    methods: {
      async createUrl() {
        this.error = '';
        const response = await fetch('/url', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            url: this.url,
            slug: this.slug || undefined,
          }),
        });
      },
    },
  });
  