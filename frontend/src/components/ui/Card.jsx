/**
 * ============================================
 *  Card
 *  iOS 26 Glassmorphic Card Component
 * ============================================
 * 
 * PROPS:
 * - variant: 'elevated' | 'outlined' | 'glass'
 * - padding: 'sm' | 'md' | 'lg'
 * - hoverable: boolean
 * - onClick: function (makes card clickable)
 * 
 * ============================================
 */
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({
    variant = 'elevated',
    padding = 'md',
    hoverable = false,
    onClick,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        hoverable && 'card-hoverable',
        onClick && 'card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['elevated', 'outlined', 'glass']),
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  hoverable: PropTypes.bool
};

