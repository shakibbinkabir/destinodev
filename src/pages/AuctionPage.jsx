import { useState, useEffect, useMemo } from 'react';
import { Gavel, Eye, Clock, Users, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import ExchangeRate from '../components/ExchangeRate';
import CTABanner from '../components/CTABanner';
import { auctions } from '../data/auctions';
import './AuctionPage.css';

function formatJPY(amount) {
  return '¥' + amount.toLocaleString();
}

function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(getRemainingTime(endsAt));

  function getRemainingTime(end) {
    const diff = new Date(end).getTime() - Date.now();
    if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0, label: 'Ended' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let label = '';
    if (hours > 0) label = `${hours}h ${minutes}m ${seconds}s`;
    else if (minutes > 0) label = `${minutes}m ${seconds}s`;
    else label = `${seconds}s`;

    return { total: diff, hours, minutes, seconds, label };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingTime(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return remaining;
}

function AuctionCard({ auction }) {
  const countdown = useCountdown(auction.endsAt);
  const [showHistory, setShowHistory] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [localBid, setLocalBid] = useState(auction.currentBid);
  const [localBids, setLocalBids] = useState(auction.totalBids);

  const isEndingSoon = countdown.total > 0 && countdown.total < 5 * 60 * 1000;
  const isEnded = countdown.total <= 0;

  const handleBid = () => {
    if (isEnded) return;
    const newBid = localBid + auction.bidIncrement;
    setLocalBid(newBid);
    setLocalBids((prev) => prev + 1);
    setBidPlaced(true);
    setTimeout(() => setBidPlaced(false), 2000);
  };

  const timeAgo = (timeStr) => {
    const diff = Date.now() - new Date(timeStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className={`auction-card${isEndingSoon ? ' auction-card--ending' : ''}${isEnded ? ' auction-card--ended' : ''}`}>
      <div className="auction-card__image-wrap">
        <div className="auction-card__image-ratio">
          <img src={auction.image} alt={`${auction.year} ${auction.make} ${auction.model}`} loading="lazy" />
        </div>
        <div className={`auction-card__timer${isEndingSoon ? ' auction-card__timer--urgent' : ''}${isEnded ? ' auction-card__timer--ended' : ''}`}>
          <Clock size={12} />
          {isEnded ? 'Auction Ended' : countdown.label}
        </div>
        <div className="auction-card__lot">
          {auction.auctionHouse} — Lot {auction.lotNumber}
        </div>
        {auction.grade && (
          <div className="auction-card__grade">
            Grade {auction.grade}
          </div>
        )}
      </div>

      <div className="auction-card__body">
        <div className="auction-card__header">
          <h3 className="auction-card__title">{auction.year} {auction.make} {auction.model}</h3>
          <div className="auction-card__specs-row">
            <span>{auction.mileage.toLocaleString()} km</span>
            <span>{auction.transmission}</span>
            <span>{auction.engineSize}</span>
            <span>{auction.color}</span>
          </div>
        </div>

        <div className="auction-card__bidding">
          <div className="auction-card__bid-current">
            <span className="auction-card__bid-label">Current Bid</span>
            <span className="auction-card__bid-amount">{formatJPY(localBid)}</span>
          </div>
          <div className="auction-card__bid-meta">
            <span className="auction-card__bid-meta-item">
              <Gavel size={12} />
              {localBids} bids
            </span>
            <span className="auction-card__bid-meta-item">
              <Eye size={12} />
              {auction.watchers} watching
            </span>
          </div>

          <div className="auction-card__bid-info">
            <div className="auction-card__bid-info-row">
              <span>Starting Price</span>
              <span>{formatJPY(auction.startingPrice)}</span>
            </div>
            <div className="auction-card__bid-info-row">
              <span>Bid Increment</span>
              <span>{formatJPY(auction.bidIncrement)}</span>
            </div>
            <div className="auction-card__bid-info-row">
              <span>Next Min Bid</span>
              <span className="auction-card__next-bid">{formatJPY(localBid + auction.bidIncrement)}</span>
            </div>
          </div>

          {!isEnded ? (
            <button className="auction-card__bid-btn" onClick={handleBid}>
              <Gavel size={16} />
              {bidPlaced ? 'Bid Placed' : `Place Bid — ${formatJPY(localBid + auction.bidIncrement)}`}
            </button>
          ) : (
            <div className="auction-card__ended-notice">
              <AlertTriangle size={14} />
              This auction has ended
            </div>
          )}

          {bidPlaced && (
            <div className="auction-card__bid-confirmation">
              Your bid of {formatJPY(localBid)} has been placed.
            </div>
          )}
        </div>

        <button
          className="auction-card__history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          Bid History ({auction.bidHistory.length})
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div className="auction-card__history">
            {auction.bidHistory.map((bid, idx) => (
              <div key={idx} className="auction-card__history-row">
                <span className="auction-card__history-bidder">{bid.bidder}</span>
                <span className="auction-card__history-amount">{formatJPY(bid.amount)}</span>
                <span className="auction-card__history-time">{timeAgo(bid.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuctionPage() {
  const [sortBy, setSortBy] = useState('ending-soon');

  const sorted = useMemo(() => {
    const list = [...auctions];
    switch (sortBy) {
      case 'ending-soon':
        return list.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
      case 'price-high':
        return list.sort((a, b) => b.currentBid - a.currentBid);
      case 'price-low':
        return list.sort((a, b) => a.currentBid - b.currentBid);
      case 'most-bids':
        return list.sort((a, b) => b.totalBids - a.totalBids);
      default:
        return list;
    }
  }, [sortBy]);

  const activeCount = auctions.filter((a) => new Date(a.endsAt) > Date.now()).length;

  return (
    <div className="auction-page">
      <PageTitle
        title="Live Auctions"
        breadcrumbs={[{ label: 'Live Auctions' }]}
      />

      <div className="auction-page__info-bar">
        <div className="wrap auction-page__info-bar-inner">
          <div className="auction-page__info-left">
            <div className="auction-page__live-indicator">
              <span className="auction-page__live-dot" />
              LIVE
            </div>
            <span className="auction-page__active-count">
              {activeCount} active auctions
            </span>
          </div>
          <div className="auction-page__info-right">
            <ExchangeRate variant="compact" />
          </div>
        </div>
      </div>

      <section className="section section--light">
        <div className="wrap">
          <div className="auction-page__toolbar">
            <div className="auction-page__toolbar-left">
              <Users size={16} />
              <span className="auction-page__toolbar-text">
                Bid on vehicles directly from Japanese auto auctions. All prices in JPY (FOB Japan).
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="auction-page__sort"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="most-bids">Most Bids</option>
            </select>
          </div>

          <div className="auction-page__sidebar-layout">
            <div className="auction-page__grid">
              {sorted.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
            <aside className="auction-page__sidebar">
              <ExchangeRate variant="full" />

              <div className="auction-page__how-it-works">
                <h4>How Auction Bidding Works</h4>
                <ol>
                  <li>Browse active auctions from Japanese auction houses</li>
                  <li>Place your bid in JPY — the minimum increment is shown on each lot</li>
                  <li>Monitor the countdown timer and bid history</li>
                  <li>If you win, our team handles inspection, export, and shipping</li>
                </ol>
              </div>

              <div className="auction-page__auction-houses">
                <h4>Auction Houses</h4>
                <ul>
                  <li>USS Tokyo</li>
                  <li>USS Yokohama</li>
                  <li>USS Nagoya</li>
                  <li>HAA Kobe</li>
                  <li>TAA Yokohama</li>
                  <li>JU Kanagawa</li>
                </ul>
              </div>

              <div className="auction-page__disclaimer">
                <AlertTriangle size={14} />
                <p>
                  All auction prices are in Japanese Yen (JPY). Additional fees include
                  auction commission, transport, export documentation, and shipping.
                  Contact us for a full cost estimate.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
