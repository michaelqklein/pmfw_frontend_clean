'use client';

import React, { useEffect, useState } from 'react';
import eventEmitter from '@shared/utils/eventEmitter';

const MessageBox = ({ visualCom }) => {
  const [monitorMessage, setMonitorMessage] = useState('');

  useEffect(() => {
    if (visualCom) {
      const handleMonitorMessageUpdate = (message) => {
        setMonitorMessage(message);
      };

      eventEmitter.on('updateMonitorMessage', handleMonitorMessageUpdate);

      return () => {
        eventEmitter.off('updateMonitorMessage', handleMonitorMessageUpdate);
      };
    }
  }, [visualCom]);

  return (
    <div
      className="
        relative
        text-center
        bg-white/80
        border-2 border-yellow-700
        rounded-lg
        shadow-sm
        overflow-hidden
        h-9
        w-80
        flex items-center justify-center
        px-4
      "
    >
      {visualCom && (
        <h1 className="text-base font-semibold truncate leading-none">
          {monitorMessage}
        </h1>
      )}
    </div>
  );
};

export default MessageBox;
