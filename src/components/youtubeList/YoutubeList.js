import React, {Component} from 'react';

class YoutubeList extends Component {

  list = this.props.items;

  renderItems = () => {
    return this.props.items.map(item => {
      console.log(item)
      return (
        <div key={item.id} className={'searchItem'}>
          {item.snippet.topLevelComment.snippet.textOriginal}
        </div>
      )
    })
  }

  render () {
    console.log('list length: ', this.props.items);

    return (
      <div style={{height: '100%'}}>
        {this.renderItems()}
      </div>
    )
  }
}

export default YoutubeList;