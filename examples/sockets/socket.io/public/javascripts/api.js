var api = (function(){
  
  var Users = {
    ns: 'Users'
  };
  
  // get individual users, or a list if no args are used
  Users.get = function(id){
    socket.emit(Users.ns+'.get', { id: id || null }, function(res){
      console.log('User::get list', res)
    });
  };
  
  // save a user
  Users.save = function(user){
    if(typeof user === "undefined")
      console.log(Users.ns+'.save error', user)
    else
      console.log(Users.ns+'.save')
  };
  
  // delete a user
  Users.delete = function(user){
    console.log(Users.ns+'.delete')
  };
  
  // return api object
  return  {
    name: 'api',
    Users: Users
  }
  
})();