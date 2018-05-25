export default function accepts (context) {
  // validation rules
  const invite = { arg: 'id', type: 'string', required: true, description: 'Invite id' };

  return {
    patch: [ invite ],
    remove: [ invite ]
  };
}
