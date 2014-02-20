Class('NX.TestClass', {
  isa: Siesta.Test.ExtJS,

  methods: {

    do: function (callback) {
      var me = this,
          params = Array.prototype.slice.call(arguments, 1);

      return function (next) {
        callback.apply(me, params);
        next();
      }
    },

    login: function () {
      var NX = this.global.NX;

      NX.direct.rapture_Security.login(
          NX.util.Base64.encode('admin'),
          NX.util.Base64.encode('admin123'),
          false,
          function (response) {
            if (Ext.isDefined(response) && response.success) {
              NX.State.setUser(response.data);
            }
          }
      );
    },

    logout: function () {
      this.controller('User').logout();
    },

    setState: function (key, value) {
      var NX = this.global.NX;

      NX.State.setValue(key, value);
    },

    controller: function (name) {
      return this.global.NX.getApplication().getController(name);
    }

  }

});