const React = require('react');

module.exports = props => {
  return (
    <footer>
      <span>Made with <a href="https://glitch.com">Glitch</a>!</span>
      <span class="ingest-guide">
        <code>curl -s -XPOST 'https://{location.hostname}/{props.bucketID}' -H 'Content-type: text/plain' -d 'A test log message!'</code><br/>
        <code><strong>msg=</strong>foo|bar</code> Fields to extract as main log message &nbsp; 
        <code><strong>meta=</strong>foo|bar</code> Only show these fields &nbsp; 
        <code><strong>time=</strong>foo|bar</code> Fields to extract as time
      </span>
    </footer>
  );
}