// Replace the following with your own Firebase SDK configuration snippet
const firebaseConfig = {
  apiKey: 'AIzaSyCyFlshG15weVdSbBzDr0IfpSooXW_dXwk',
  authDomain: 'brainstorming-6cff9.firebaseapp.com',
  projectId: 'brainstorming-6cff9',
  storageBucket: 'brainstorming-6cff9.appspot.com',
  messagingSenderId: '1047494055575',
  appId: '1:1047494055575:web:e0961b14ca10e448307bd2',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const userId = localStorage.getItem('userId') || generateUserId();

function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', userId);
}

const ideaForm = document.getElementById('idea-form');
const ideasList = document.getElementById('ideas-list');

ideaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idea = document.getElementById('idea').value;
  addIdea(idea);
  ideaForm.reset();
});

function addIdea(idea) {
  db.collection('ideas')
    .add({ idea, votes: 0, userVotes: {} })
    .catch((error) => console.error('Error adding idea: ', error));
}

function voteIdea(id, votes, userVotes) {
  const userVoteCount = userVotes[userId] || 0;

  if (userVoteCount < 3) {
    userVotes[userId] = userVoteCount + 1;
    db.collection('ideas')
      .doc(id)
      .update({ votes: votes + 1, userVotes: userVotes })
      .catch((error) => console.error('Error updating idea: ', error));
  }
}

function retrieveVote(id, votes, userVotes) {
  const userVoteCount = userVotes[userId] || 0;

  if (userVoteCount > 0) {
    userVotes[userId] = userVoteCount - 1;
    db.collection('ideas')
      .doc(id)
      .update({ votes: votes - 1, userVotes: userVotes })
      .catch((error) => console.error('Error updating idea: ', error));
  }
}

db.collection('ideas').onSnapshot((snapshot) => {
  ideasList.innerHTML = '';
  snapshot.forEach((doc) => {
    const li = document.createElement('li');
    const userVoteCount = doc.data().userVotes?.[userId] || 0;
    li.innerHTML = `${doc.data().idea} (Votes: All ${
      doc.data().votes
    }; Yours ${userVoteCount})`;

    const buttons = document.createElement('div');

    const voteBtn = document.createElement('button');
    voteBtn.textContent = 'Vote';
    voteBtn.disabled = userVoteCount >= 3;
    voteBtn.addEventListener('click', () =>
      voteIdea(doc.id, doc.data().votes, doc.data().userVotes)
    );
    buttons.appendChild(voteBtn);

    const retrieveVoteBtn = document.createElement('button');
    retrieveVoteBtn.textContent = 'Retrieve vote';
    retrieveVoteBtn.disabled = userVoteCount === 0;
    retrieveVoteBtn.addEventListener('click', () =>
      retrieveVote(doc.id, doc.data().votes, doc.data().userVotes)
    );
    buttons.appendChild(retrieveVoteBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeIdea(doc.id));
    // li.appendChild(removeBtn);
    li.appendChild(buttons);
    ideasList.appendChild(li);
  });
});

function removeIdea(id) {
  db.collection('ideas')
    .doc(id)
    .delete()
    .catch((error) => console.error('Error removing idea: ', error));
}
