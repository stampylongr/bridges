import PropTypes from 'prop-types';
import React from 'react';
import { Motion, StaggeredMotion, spring, presets } from 'react-motion';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import ConnectPrompt from './ConnectPrompt';

export default class HelloWorld extends React.PureComponent {
  static propTypes = {
    status: PropTypes.string,
    total: PropTypes.number,
    at: PropTypes.number,
    results: PropTypes.array.isRequired,
    domains: PropTypes.array.isRequired,
    inProgress: PropTypes.bool.isRequired,
    fetchProgress: PropTypes.func.isRequired,
    fetchResults: PropTypes.func.isRequired,
    mastodonIsConnected: PropTypes.bool.isRequired,
    defaultDomains: PropTypes.array.isRequired,
  };

  componentDidMount () {
    const { fetchProgress } = this.props;
    fetchProgress();
  }

  render () {
    const { status, inProgress, at, total, results, domains, defaultDomains, mastodonIsConnected } = this.props;

    if (inProgress) {
      const pct   = total > 0 ? (at / total).toFixed(2) * 100 : 10;
      const label = total > 0 ? <span>{at || 0} / {total || 0}</span> : 'Preparing';

      return (
        <div>
          <div className='page-heading'>
            <h3>
              Searching for your friends...
              <small>Please wait while your Twitter friends are being fetched</small>
            </h3>
          </div>

          <div className='progress-bar'>
            <Motion defaultStyle={{ x: 0 }} style={{ x: spring(pct, presets.wobbly) }}>
              {value => <div style={{ width: `${value.x}%` }} />}
            </Motion>

            <div>{label}</div>
          </div>
        </div>
      );
    } else if (results.length === 0 && !mastodonIsConnected) {
      return (
        <div>
          <ConnectPrompt isPioneer domains={defaultDomains} />
        </div>
      );
    }

    return (
      <div>
        {mastodonIsConnected ? (<div className='page-heading'>
          <h3>
            Your friends
            <small>Here are your Twitter friends who are on Mastodon:</small>
          </h3>
        </div>) : <ConnectPrompt domains={defaultDomains} />}

        {results.length === 0 && <p className='lead'>
          Right now, there are no results to be shown here. But maybe your friends haven't used this tool yet! Or maybe you are the trendsetter!
        </p>}

        {results.length > 0 && mastodonIsConnected && <div style={{ textAlign: 'center', marginTop: -10, marginBottom: 20 }}>
          <a className='candy-button' href='/friends/follow_all' data-method='post'>Follow all friends on Mastodon</a>
        </div>}

        {results.length > 0 && <StaggeredMotion defaultStyles={results.map(_ => ({ scale: 0 }))} styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
          return i == 0
            ? { scale: spring(1, presets.gentle) }
            : { scale: spring(prevInterpolatedStyles[i - 1].scale, presets.gentle) };
        })}>
          {interpolatingStyles => (
            <div className='grid'>
              {interpolatingStyles.map((style, i) => (
                <a target='_blank' href={results[i].mastodon_url} style={{ transformOrigin: 'center center', transform: `scale(${style.scale})` }} key={results[i].mastodon_username} className='user-card' title={`@${results[i].twitter_username} on Twitter`}>
                  <div className='avatar'><img src={results[i].avatar_url} /></div>

                  {results[i].following && <div className='following-indicator'>
                    <i className='fa fa-check' />
                  </div>}

                  <div className='name'>
                    <span className='display-name'>{results[i].display_name}</span>
                    <span className='username'>@{results[i].mastodon_username}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </StaggeredMotion>}

        <div className='page-heading'>
          <h3>
            Your friends' instances
            <small>Here are the servers your friends are using:</small>
          </h3>
        </div>

        <div className='grid' id='domains'>
          {(domains.length > 0 ? domains : defaultDomains).map(domain => (
            <a target='_blank' className='instance-card' href={`https://${domain.uri}/about`} key={domain.uri} style={{ backgroundImage: `url(${domain.thumbnail})` }}>
              <div className='info'>
                <span className='title'>{domain.title}</span>
                <span className='uri'>{domain.uri}</span>

                {domain.stats && <span className='users'> (<FormattedMessage id='num_users' defaultMessage='{formatted_count} {count, plural, one {person} other {people}}' values={{ count: domain.stats.user_count, formatted_count: <FormattedNumber value={domain.stats.user_count} /> }} />)</span>}
              </div>
            </a>
          ))}

          <a target='_blank' className='instance-card' href='https://joinmastodon.org/#getting-started'>
            <div className='info'>
              <span className='title'>Find more on</span>
              <span className='uri'>joinmastodon.org</span>
            </div>
          </a>
        </div>
      </div>
    );
  }
}
